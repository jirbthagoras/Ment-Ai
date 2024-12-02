import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, onValue, push, set } from 'firebase/database';
import { realtimeDb, auth } from '../../firebase';
import { FaPaperPlane, FaArrowLeft, FaClock, FaUser, FaSmile, FaUserMd } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

export default function RuangKonsultasiUser() {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [consultationStatus, setConsultationStatus] = useState('waiting');
  const { appointmentId, doctorName, appointmentDetails } = location.state || {};
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  useEffect(() => {
    if (!appointmentId || !location.state) {
      navigate('/profile');
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
    });

    return () => {
      statusUnsubscribe();
      messagesUnsubscribe();
    };
  }, [appointmentId, navigate, location.state]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || consultationStatus !== 'active') return;

    const messagesRef = ref(realtimeDb, `consultation-rooms/${appointmentId}/messages`);
    const newMessageRef = push(messagesRef);
    
    await set(newMessageRef, {
      text: newMessage,
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || 'Patient',
      timestamp: new Date().toISOString(),
      type: 'patient'
    });

    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-all duration-200 bg-white/80 px-4 py-2 rounded-full shadow-sm"
            >
              <FaArrowLeft className="mr-2" />
              <span className="font-medium">Kembali</span>
            </motion.button>
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center bg-blue-600/10 px-6 py-3 rounded-full shadow-sm"
            >
              <div className="relative">
                <FaUserMd className="text-blue-600 text-2xl" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="ml-3">
                <span className="font-semibold text-blue-800">{doctorName}</span>
                <span className="text-xs text-blue-600 block">Online</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col items-end bg-white/80 px-5 py-3 rounded-xl shadow-sm"
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
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md h-[calc(100vh-250px)] flex flex-col">
          {/* Consultation Status Banner */}
          {consultationStatus !== 'active' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border-b border-yellow-100 p-4 text-center"
            >
              <div className="text-yellow-800 font-medium">
                {consultationStatus === 'waiting' ? (
                  <>
                    <FaClock className="inline-block mr-2" />
                    Menunggu dokter memulai konsultasi
                  </>
                ) : (
                  <>
                    <FaUser className="inline-block mr-2" />
                    Konsultasi telah berakhir
                  </>
                )}
              </div>
              <div className="text-sm text-yellow-600 mt-1">
                {consultationStatus === 'waiting' 
                  ? 'Anda dapat melihat riwayat chat namun belum dapat mengirim pesan'
                  : 'Terima kasih telah menggunakan layanan konsultasi kami'}
              </div>
            </motion.div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'patient' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] rounded-lg p-3 ${
                  message.type === 'patient'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="text-sm font-medium mb-1">{message.senderName}</div>
                  <div>{message.text}</div>
                  <div className="text-xs mt-1 opacity-75">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-blue-50 bg-gray-50/80 backdrop-blur-md">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={
                    consultationStatus === 'active'
                      ? "Ketik pesan..."
                      : "Menunggu dokter memulai konsultasi..."
                  }
                  disabled={consultationStatus !== 'active'}
                  className={`w-full rounded-full pl-6 pr-24 py-4 border border-blue-100 
                    focus:outline-none focus:ring-2 focus:ring-blue-400 
                    focus:border-transparent transition-all duration-200 
                    ${consultationStatus !== 'active' 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : 'bg-white/90'}`}
                />
                {consultationStatus === 'active' && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-gray-400 hover:text-blue-500 transition-colors p-2"
                    >
                      <FaSmile className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}

                {/* Emoji Picker */}
                <AnimatePresence>
                  {showEmojiPicker && consultationStatus === 'active' && (
                    <motion.div
                      ref={emojiPickerRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 bottom-full mb-2"
                    >
                      <EmojiPicker
                        onEmojiClick={(emojiObject) => {
                          setNewMessage(prev => prev + emojiObject.emoji);
                          setShowEmojiPicker(false);
                        }}
                        width={325}
                        height={400}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={consultationStatus !== 'active'}
                className={`rounded-full p-4 transition-all duration-200 
                  ${consultationStatus === 'active'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                <FaPaperPlane className="w-5 h-5" />
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 