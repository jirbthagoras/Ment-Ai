import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, onValue, push, set, update } from 'firebase/database';
import { realtimeDb, auth } from '../../firebase';
import { FaPaperPlane, FaArrowLeft, FaClock, FaUser, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

export default function RuangKonsultasi() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [consultationStatus, setConsultationStatus] = useState('ready'); // 'ready', 'active', 'ended'
  const { appointmentId, patientName, doctorName, appointmentDetails } = location.state || {};
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    if (!appointmentId || !location.state) {
      navigate('/admin');
      return;
    }

    // Listen to consultation status
    const statusRef = ref(realtimeDb, `consultation-rooms/${appointmentId}/status`);
    const statusUnsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setConsultationStatus(snapshot.val());
      }
    });

    // Subscribe to messages
    const messagesRef = ref(realtimeDb, `consultation-rooms/${appointmentId}/messages`);
    const messagesUnsubscribe = onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesList = Object.entries(messagesData).map(([id, data]) => ({
          id,
          ...data,
        }));
        setMessages(messagesList);
      }
      setIsLoading(false);
    });

    return () => {
      statusUnsubscribe();
      messagesUnsubscribe();
    };
  }, [appointmentId, navigate]);

  const handleStartConsultation = async () => {
    try {
      const statusRef = ref(realtimeDb, `consultation-rooms/${appointmentId}/status`);
      await set(statusRef, 'active');
      
      // Add system message
      const messagesRef = ref(realtimeDb, `consultation-rooms/${appointmentId}/messages`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, {
        text: 'Konsultasi telah dimulai',
        type: 'system',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error starting consultation:', error);
    }
  };

  const handleEndConsultation = async () => {
    try {
      const statusRef = ref(realtimeDb, `consultation-rooms/${appointmentId}/status`);
      await set(statusRef, 'ended');
      
      // Add system message
      const messagesRef = ref(realtimeDb, `consultation-rooms/${appointmentId}/messages`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, {
        text: 'Konsultasi telah selesai',
        type: 'system',
        timestamp: new Date().toISOString()
      });

      // Update appointment status
      const appointmentRef = ref(realtimeDb, `appointments/${appointmentId}`);
      await update(appointmentRef, {
        status: 'completed',
        endedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error ending consultation:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messagesRef = ref(realtimeDb, `consultation-rooms/${appointmentId}/messages`);
    const newMessageRef = push(messagesRef);
    
    await set(newMessageRef, {
      text: newMessage,
      senderId: auth.currentUser.uid,
      senderName: doctorName,
      timestamp: new Date().toISOString(),
      type: 'doctor'
    });

    setNewMessage('');
  };

  // Add emoji picker click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header with Glass Effect */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin')}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-all duration-200 bg-white/80 px-4 py-2 rounded-full shadow-sm w-full sm:w-auto justify-center sm:justify-start"
            >
              <FaArrowLeft className="mr-2" />
              <span className="font-medium">Kembali</span>
            </motion.button>
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center bg-blue-600/10 px-6 py-3 rounded-full shadow-sm w-full sm:w-auto justify-center"
            >
              <div className="relative">
                <FaUser className="text-blue-600 text-2xl" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="ml-3">
                <span className="font-semibold text-blue-800">{patientName}</span>
                <span className="text-xs text-blue-600 block">Online</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col items-center sm:items-end bg-white/80 px-5 py-3 rounded-xl shadow-sm w-full sm:w-auto"
            >
              <div className="flex items-center text-blue-600 font-medium">
                <FaClock className="mr-2" />
                <span>{appointmentDetails?.time || 'Time not set'}</span>
              </div>
              <div className="text-xs mt-1 text-gray-600">
                {appointmentDetails?.date || 'Date not set'}
              </div>
            </motion.div>
          </div>

          {/* Add consultation controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            {consultationStatus === 'ready' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartConsultation}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium w-full sm:w-auto"
              >
                Mulai Konsultasi
              </motion.button>
            )}
            {consultationStatus === 'active' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEndConsultation}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium w-full sm:w-auto"
              >
                Akhiri Konsultasi
              </motion.button>
            )}
            <div className="text-sm text-center sm:text-left w-full sm:w-auto">
              Status: 
              <span className={`ml-2 font-medium ${
                consultationStatus === 'ready' ? 'text-yellow-600' :
                consultationStatus === 'active' ? 'text-green-600' :
                'text-red-600'
              }`}>
                {consultationStatus === 'ready' ? 'Menunggu Dimulai' :
                 consultationStatus === 'active' ? 'Konsultasi Aktif' :
                 'Konsultasi Selesai'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Chat Container */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100/50 h-[calc(100vh-280px)] sm:h-[calc(100vh-220px)] flex flex-col"
        >
          {/* Chat Header Info */}
          <div className="px-3 sm:px-6 py-4 border-b border-blue-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">ID: #{appointmentId?.slice(-6)}</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active Session
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Session started at {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'doctor' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 sm:p-4 ${
                  message.type === 'doctor'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                    : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border border-gray-100'
                }`}>
                  <div className="text-sm font-medium mb-1 flex items-center">
                    {message.type === 'patient' && (
                      <div className="bg-blue-100 p-1 rounded-full mr-2">
                        <FaUser className="text-blue-600" />
                      </div>
                    )}
                    {message.senderName}
                  </div>
                  <div className="text-[15px] leading-relaxed">{message.text}</div>
                  <div className={`text-xs mt-2 flex items-center ${
                    message.type === 'doctor' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    <FaClock className="mr-1 text-[10px]" />
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Message Input */}
          <div className="p-2 sm:p-4 border-t border-blue-50 bg-gray-50/80 backdrop-blur-md rounded-b-2xl">
            <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="w-full rounded-full pl-4 sm:pl-6 pr-16 sm:pr-24 py-3 sm:py-4 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white/90 text-sm sm:text-base"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 sm:space-x-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-gray-400 hover:text-blue-500 transition-colors p-1 sm:p-2"
                  >
                    <FaSmile className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </div>

                {/* Emoji Picker Popup */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div
                      ref={emojiPickerRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 bottom-full mb-2 z-50"
                    >
                      <div className="shadow-xl rounded-lg overflow-hidden scale-90 sm:scale-100 origin-bottom-right">
                        <EmojiPicker
                          onEmojiClick={onEmojiClick}
                          autoFocusSearch={false}
                          width={window.innerWidth < 640 ? 280 : 325}
                          height={350}
                          searchPlaceHolder="Cari emoji..."
                          previewConfig={{
                            showPreview: false
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full p-3 sm:p-4 hover:shadow-lg transition-all duration-200 shadow-md"
              >
                <FaPaperPlane className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Session Info */}
        <div className="mt-4 text-center text-xs sm:text-sm text-gray-500">
          <span className="inline-flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Secure end-to-end consultation session
          </span>
        </div>
      </div>
    </div>
  );
} 