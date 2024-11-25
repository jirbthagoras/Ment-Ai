'use client'

import { useEffect, useState } from 'react'
import { FaUser, FaComments, FaCalendarAlt, FaBell, FaSearch, FaFilter, FaMoneyBillWave, FaClock } from 'react-icons/fa'
import { auth } from '../firebase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  getUserData, 
  getMessages, 
  getTodayAppointments,
  getActiveAppointments,
  filterActiveAppointments
} from '../services/adminService'
import { useNavigate } from 'react-router-dom';
import { createChatRoom, checkChatRoomExists } from '../services/chatService';

// Add bell animation configuration
const bellAnimation = {
  whileHover: { 
    rotate: [0, 15, -15, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity
    }
  },
  whileTap: { 
    scale: 0.9 
  }
};

const renderTags = (tags) => (
  tags.map((tag, tagIndex) => (
    <motion.span
      key={tagIndex}
      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: tagIndex * 0.1 }}
    >
      {tag}
    </motion.span>
  ))
)

const renderMessages = (messages) => {
  if (messages.length === 0) {
    return (
      <motion.div
        className="text-gray-500 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      >
        Belum ada pesan terbaru
      </motion.div>
    )
  }

  return messages.map((message, index) => (
    <motion.div
      key={index}
      className="bg-white rounded-lg p-4 shadow"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="font-medium text-gray-800">{message.patientName}</div>
          <p className="text-sm text-gray-600 mt-1">{message.message}</p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{message.status}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{message.type}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">{message.time}</div>
      </div>
    </motion.div>
  ))
}

export default function Admin() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [appointments, setAppointments] = useState([])
  const [messages, setMessages] = useState([])
  const [patientCount, setPatientCount] = useState(0)
  const [completedConsultations, setCompletedConsultations] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isFiltering, setIsFiltering] = useState(false)
  const [chatRoomStatus, setChatRoomStatus] = useState({});
  const navigate = useNavigate();

  // Get filtered appointments
  const filteredAppointments = filterActiveAppointments(appointments, searchTerm, filterStatus);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        try {
          // Get user data
          const userData = await getUserData(currentUser.uid);
          if (userData) {
            setUsername(userData.username || 'User');
          }

          // Set up appointments listener with active appointments only
          const unsubscribeAppointments = getActiveAppointments((appointmentList) => {
            setAppointments(appointmentList);
            const completed = appointmentList.filter(app => app.status === 'completed');
            setCompletedConsultations(completed.length);
          });

          // Set up messages listener
          const unsubscribeMessages = getMessages((messagesList) => {
            setMessages(messagesList);
          });

          // Set up today's appointments listener
          const unsubscribeTodayAppointments = getTodayAppointments((count) => {
            setPatientCount(count);
          });

          return () => {
            unsubscribeAppointments();
            unsubscribeMessages();
            unsubscribeTodayAppointments();
          };
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Handle not authenticated
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Check existing chat rooms for appointments
    const checkChatRooms = async () => {
      const status = {};
      for (const appointment of appointments) {
        try {
          status[appointment.id] = await checkChatRoomExists(appointment.id);
        } catch (error) {
          console.error(`Error checking chat room for ${appointment.id}:`, error);
          status[appointment.id] = false;
        }
      }
      setChatRoomStatus(status);
    };

    if (appointments.length > 0) {
      checkChatRooms();
    }
  }, [appointments]);

  const handleChatAction = async (appointment) => {
    try {
      if (!chatRoomStatus[appointment.id]) {
        // Create chat room
        await createChatRoom(appointment.id);
        setChatRoomStatus(prev => ({
          ...prev,
          [appointment.id]: true
        }));
      }
      
      // Navigate to chat
      navigate('/adminchat', { 
        state: { 
          appointmentId: appointment.id,
          patientName: appointment.patientName,
          doctorName: appointment.doctor
        }
      });
    } catch (error) {
      console.error('Error handling chat action:', error);
      // Add error notification here if needed
    }
  };

  const renderAppointmentCard = (appointment, index) => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    const isToday = appointmentDate.setHours(0,0,0,0) === today.setHours(0,0,0,0);
    
    // Calculate time remaining for today's appointments
    let timeRemaining = null;
    if (isToday && appointment.times?.length > 0) {
      const [hours, minutes] = appointment.times[0].split(':').map(Number);
      const appointmentTime = new Date();
      appointmentTime.setHours(hours, minutes, 0, 0);
      
      if (appointmentTime > new Date()) {
        const diff = appointmentTime - new Date();
        const hoursRemaining = Math.floor(diff / (1000 * 60 * 60));
        const minutesRemaining = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        timeRemaining = `${hoursRemaining}h ${minutesRemaining}m remaining`;
      }
    }

    return (
      <motion.div
        key={appointment.id}
        className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <div className="flex flex-col md:flex-row justify-between gap-4">
          {/* Left Section - Patient Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaUser className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">
                  {appointment.patientName}
                </h3>
                <p className="text-gray-600 text-sm">
                  Patient ID: {appointment.id.slice(0, 8)}
                </p>
              </div>
            </div>

            {/* Doctor and Schedule Info */}
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-gray-700">
                <FaUser className="text-blue-500" />
                <span className="font-medium">Dr. {appointment.doctor}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-700">
                <FaCalendarAlt className="text-blue-500" />
                <span>{new Date(appointment.date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>

              {/* Time Slots */}
              <div className="flex flex-wrap gap-2 mt-2">
                {appointment.times && appointment.times.map((time, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {appointment.tags && renderTags(appointment.tags)}
            </div>
          </div>

          {/* Right Section - Status and Actions */}
          <div className="md:w-48 flex flex-col items-end justify-between">
            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              appointment.status === 'pending' 
                ? 'bg-yellow-100 text-yellow-800' 
                : appointment.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {appointment.status.toUpperCase()}
            </div>

            {/* Payment Info */}
            <div className="text-right mt-4">
              <div className="flex items-center justify-end gap-2 text-gray-600">
                <FaMoneyBillWave className="text-green-500" />
                <span className="font-medium">{appointment.paymentMethod}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {appointment.quantity} sesi
              </div>
              <div className="font-semibold text-gray-800 mt-1">
                Rp{appointment.totalAmount?.toLocaleString('id-ID')}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mt-4 w-full">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleChatAction(appointment)}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chatRoomStatus[appointment.id]
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {chatRoomStatus[appointment.id] ? 'ATTEND' : 'CREATE ROOM'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                View Details
              </motion.button>
            </div>
          </div>
        </div>

        {/* Progress Bar (for pending appointments) */}
        {appointment.status === 'pending' && (
          <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        )}

        {/* Add time remaining indicator for today's appointments */}
        {timeRemaining && (
          <motion.div 
            className="mt-4 text-sm font-medium text-blue-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FaClock className="inline-block mr-2" />
            {timeRemaining}
          </motion.div>
        )}
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#8e94f2] to-[#1e4287] flex items-center justify-center">
        <motion.div
          className="text-white text-4xl font-bold"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-[#8e94f2] to-[#1e4287] p-4 md:p-8 text-white font-jakarta"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex flex-col items-center mb-8"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="w-full flex justify-end mb-4">
          <motion.div
            className="relative"
            {...bellAnimation}
          >
            <FaBell className="text-2xl cursor-pointer hover:text-yellow-300 transition-colors" />
            {messages.length > 0 && (
              <motion.span
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                {messages.length}
              </motion.span>
            )}
          </motion.div>
        </div>
        
        <h1 className="mt-52 text-4xl italic font-light text-center">
          Halo Selamat datang, { }
          <motion.span 
            className="font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {username}
          </motion.span>
        </h1>
        <p className="mt-5 mb-32 text-3xl italic font-light opacity-90 text-center">Selamat Bekerja, Semoga hari mu indah</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          className="bg-white rounded-lg p-6 shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pasien..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFiltering(!isFiltering)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FaFilter className="text-gray-600" />
            </motion.button>
          </div>

          <AnimatePresence>
            {isFiltering && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pending', 'completed', 'cancelled'].map((status) => (
                    <motion.button
                      key={status}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-full text-sm ${
                        filterStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      } transition-colors`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <h2 className="text-4xl font-semibold text-purple-900 flex items-center justify-center mb-10">
            <FaCalendarAlt className="mr-2" />
            Upcoming Schedule
          </h2>
          
          <AnimatePresence>
            {filteredAppointments.length === 0 ? (
              <motion.div
                className="mt-20 text-purple-900 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada jadwal terbaru'}
              </motion.div>
            ) : (
              <motion.div
                className="space-y-4 max-h-[500px] overflow-y-auto pr-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredAppointments.map((appointment, index) => 
                  renderAppointmentCard(appointment, index)
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="mb-16 space-y-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <div className="bg-white/95 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">INFORMASI HARIAN</h2>
            <div className="text-lg font-semibold text-purple-900 mb-4">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            <motion.div
              className="bg-blue-50 rounded-lg p-4 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FaComments className="text-blue-600" />
                New Message!
              </h3>
              <div className="space-y-4 max-h-[200px] pr-2">
                {renderMessages(messages)}
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="bg-blue-100 rounded-lg p-6 text-center cursor-pointer"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-sm font-medium text-blue-900">Pasien Hari Ini</div>
                <motion.div
                  className="text-4xl font-bold text-blue-700 mt-2"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  {patientCount}
                </motion.div>
              </motion.div>
              <motion.div
                className="bg-blue-100 rounded-lg p-6 text-center cursor-pointer"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-sm font-medium text-blue-900">Selesai Konsultasi</div>
                <motion.div
                  className="text-4xl font-bold text-blue-700 mt-2"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.3 }}
                >
                  {completedConsultations}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}