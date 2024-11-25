import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaRegSmile, FaPaperPlane } from 'react-icons/fa';
import { MdVideocam } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { 
  getAppointments, 
  getChatMessages, 
  sendMessage, 
  getUserOnlineStatus,
  createChatRoom
} from '../services/chatService';

export default function AdminChat() {
  const location = useLocation();
  const { appointmentId } = location.state || {};

  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [isUserOnline, setIsUserOnline] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const chatAreaVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  useEffect(() => {
    const unsubscribe = getAppointments((appointmentsList) => {
      const now = new Date();
      const fiveDaysFromNow = new Date();
      fiveDaysFromNow.setDate(now.getDate() + 5);
      
      const activeAppointments = appointmentsList.filter(appointment => {
        if (!appointment?.date || !appointment?.time) {
          return false;
        }

        // Convert appointment time string to Date object
        const appointmentDate = new Date(appointment.date);
        const appointmentTime = appointment.time.split('-')?.[1] || '00:00'; // Fallback to '00:00' if split fails
        const [hours, minutes] = appointmentTime.split(':');
        
        appointmentDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0);
        
        return appointmentDate >= now && appointmentDate <= fiveDaysFromNow;
      });

      // Sort by date and time
      activeAppointments.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA - dateB;
        }
        return a.time.localeCompare(b.time);
      });

      setAppointments(activeAppointments);
    });

    return () => unsubscribe();
  }, []);

  // Group appointments by date
  const groupedAppointments = appointments.reduce((groups, appointment) => {
    const date = new Date(appointment.date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {});

  useEffect(() => {
    // If we have an appointmentId from navigation, select that chat
    if (appointmentId) {
      const appointment = appointments.find(app => app.id === appointmentId);
      if (appointment) {
        setSelectedChat(appointment);
        
        // Subscribe to chat messages
        const unsubscribeMessages = getChatMessages(appointmentId, (messagesList) => {
          setMessages(messagesList);
        });

        // Subscribe to user online status
        const unsubscribeStatus = getUserOnlineStatus(appointment.userId, (status) => {
          setIsUserOnline(status);
        });

        return () => {
          unsubscribeMessages();
          unsubscribeStatus();
        };
      }
    }
  }, [appointmentId, appointments]);

  const handleCreateChatRoom = async (appointment) => {
    try {
      await createChatRoom(appointment.id);
      setSelectedChat(appointment);
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    try {
      await sendMessage(selectedChat.id, message.trim());
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error handling UI feedback here
    }
  };

  const renderMessages = () => {
    return messages.map((msg) => (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
            msg.senderRole === 'admin'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p>{msg.content}</p>
          <span className="text-xs opacity-70">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </motion.div>
    ));
  };

  const renderAppointmentCard = (appointment, index) => {
    return (
      <motion.div
        key={appointment.id}
        variants={listItemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: index * 0.1 }}
        className="p-4 border-b border-gray-200"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Patient ID: {appointment.patientId}</h3>
            <p className="text-sm text-gray-500">
              {appointment.time}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCreateChatRoom(appointment)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Attend
          </motion.button>
        </div>
      </motion.div>
    );
  };

  const renderChatHeader = () => (
    <div className="px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaUser className="text-blue-500 text-xl" />
          </motion.div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedChat.patientName}
            </h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isUserOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              <p className="text-sm text-gray-500">
                {isUserOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Dr. {selectedChat.doctorName}
          </span>
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full transition-colors"
          >
            <MdVideocam className="text-blue-500 text-2xl" />
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#8e94f2] to-[#1e4287] p-6">
      <motion.div 
        className="mt-20 flex w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Sidebar - Patient List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          {appointments.length > 0 ? (
            Object.entries(groupedAppointments).map(([date, dateAppointments]) => (
              <div key={date}>
                <div className="bg-gray-50 px-4 py-2 sticky top-0 z-10">
                  <h3 className="font-semibold text-gray-700">{date}</h3>
                </div>
                {dateAppointments.map((appointment, index) => renderAppointmentCard(appointment, index))}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              <p>Tidak ada jadwal konsultasi aktif</p>
            </div>
          )}
        </div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          <AnimatePresence mode="wait">
            {selectedChat ? (
              <motion.div
                key="chat"
                className="flex-1 flex flex-col"
                variants={chatAreaVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Chat Header */}
                {renderChatHeader()}

                {/* Chat Messages */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {renderMessages()}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage}>
                  <div className="flex items-center space-x-4 bg-gray-50 rounded-full px-4 py-2 shadow-inner">
                    <motion.button
                      type="button" 
                      whileHover={{ scale: 1.1, rotate: 15 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FaRegSmile className="text-gray-500 text-xl" />
                    </motion.button>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 py-2 focus:outline-none"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.1, x: -4 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                      disabled={!message.trim()}
                    >
                      <FaPaperPlane className="text-xl" />
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                className="flex-1 flex items-center justify-center"
                variants={chatAreaVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="text-center">
                  <motion.div 
                    className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.8 }}
                  >
                    <FaUser className="text-blue-500 text-2xl" />
                  </motion.div>
                  <p className="text-gray-500 text-lg">
                    Select a chat to start messaging
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}