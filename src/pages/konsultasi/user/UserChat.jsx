import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, onValue, push, update } from 'firebase/database';
import { realtimeDb, auth } from '../../../firebase';
import { FaUser, FaPaperPlane, FaRegSmile } from 'react-icons/fa';
import { MdVideocam } from 'react-icons/md';

export default function UserChat() {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [isDoctorOnline, setIsDoctorOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    setIsLoading(true);

    // Subscribe to room data
    const roomRef = ref(realtimeDb, `consultation-rooms/${consultationId}`);
    const unsubscribeRoom = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRoomData(data);
        setIsDoctorOnline(data.participants?.doctor?.online || false);
      }
    });

    // Subscribe to messages
    const messagesRef = ref(realtimeDb, `messages/${consultationId}`);
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesArray = Object.entries(snapshot.val())
          .map(([id, data]) => ({
            id,
            ...data
          }))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(messagesArray);
      }
      setIsLoading(false);
    });

    // Update user's online status
    const userStatusRef = ref(realtimeDb, `consultation-rooms/${consultationId}/participants/patient`);
    update(userStatusRef, {
      online: true,
      lastSeen: new Date().toISOString()
    });

    // Cleanup on unmount
    return () => {
      unsubscribeRoom();
      unsubscribeMessages();
      update(userStatusRef, {
        online: false,
        lastSeen: new Date().toISOString()
      });
    };
  }, [consultationId, navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messagesRef = ref(realtimeDb, `messages/${consultationId}`);
      await push(messagesRef, {
        content: newMessage.trim(),
        senderId: auth.currentUser.uid,
        senderRole: 'patient',
        timestamp: new Date().toISOString()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-gray-500"
        >
          Loading chat...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#8e94f2] to-[#1e4287]">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto"
        >
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FaUser className="text-2xl text-gray-600" />
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                  isDoctorOnline ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {roomData?.metadata?.doctorName || 'Doctor'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isDoctorOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <MdVideocam className="text-2xl text-blue-500" />
            </motion.button>
          </div>

          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="h-[calc(100vh-300px)] overflow-y-auto p-6 bg-gray-50"
          >
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${
                    message.senderRole === 'patient' ? 'justify-end' : 'justify-start'
                  } mb-4`}
                >
                  <div className={`max-w-[70%] ${
                    message.senderRole === 'patient'
                      ? 'bg-blue-500 text-white rounded-l-xl rounded-tr-xl'
                      : 'bg-gray-200 text-gray-800 rounded-r-xl rounded-tl-xl'
                  } px-4 py-2 shadow-sm`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </AnimatePresence>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <FaRegSmile className="text-xl" />
              </motion.button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <motion.button
                type="submit"
                disabled={!newMessage.trim()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-3 rounded-full ${
                  newMessage.trim()
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <FaPaperPlane className="text-lg" />
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 