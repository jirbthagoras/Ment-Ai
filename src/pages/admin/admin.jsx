'use client'

import { useEffect, useState } from 'react'
import { FaUser, FaComments, FaCalendarAlt, FaBell, FaSearch, FaFilter, FaMoneyBillWave, FaClock, FaArrowRight, FaUserMd, FaChartLine, FaStethoscope, FaHospital, FaClipboardList, FaChevronUp, FaChevronDown } from 'react-icons/fa'
import { auth } from '../../firebase'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {  
  getMessages, 
  getTodayAppointments,
  getActiveAppointments
} from '../../services/adminService'
import { useNavigate } from 'react-router-dom';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { isToday, isTomorrow } from 'date-fns';
import PropTypes from 'prop-types';

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

const EnhancedAppointmentCard = ({ appointment, handleChatAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return `${statusStyles[status]} px-3 py-1 rounded-full text-sm font-medium border`;
  };

  const getTimeRemaining = (appointmentDate, appointmentTime) => {
    const now = new Date();
    const [hours, minutes] = appointmentTime.split(':');
    const appointment = new Date(appointmentDate);
    appointment.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const endTime = new Date(appointment);
    endTime.setHours(endTime.getHours() + 1); // 60-minute session

    if (now >= appointment && now < endTime) {
      const remainingMins = Math.floor((endTime - now) / (1000 * 60));
      return `${remainingMins} minutes remaining`;
    }

    const diff = appointment - now;
    if (diff < 0) return 'Session ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `Starts in ${days} days`;
    if (hrs > 0) return `Starts in ${hrs} hours`;
    if (mins > 0) return `Starts in ${mins} minutes`;
    return 'Starting now';
  };

  return (
    <motion.div
      layout
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section with Enhanced Patient Info */}
      <div className="p-5 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
              <FaUser className="text-blue-600 text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold text-gray-800">
                  {appointment.patientName}
                </h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                  ID: #{appointment.id?.slice(0, 6)}
                </span>
                <span className={getStatusBadge(appointment.status)}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <FaCalendarAlt className="text-blue-500" />
                  {new Date(appointment.date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <FaClock className="text-blue-500" />
                  {appointment.times[0]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-sm font-medium text-blue-600">
              {getTimeRemaining(appointment.date, appointment.times[0])}
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleChatAction(appointment)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all duration-200 shadow-md"
            >
              Enter Room
              <FaArrowRight />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="p-5">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <FaStethoscope className="text-blue-500" />
              <span className="text-sm font-medium">Session Type</span>
            </div>
            <p className="text-gray-800 font-medium">
              {appointment.type || 'Regular Checkup'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <FaClock className="text-blue-500" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <p className="text-gray-800 font-medium">60 minutes</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <FaUserMd className="text-blue-500" />
              <span className="text-sm font-medium">Doctor</span>
            </div>
            <p className="text-gray-800 font-medium">
              {appointment.doctor || 'Dr. Assigned'}
            </p>
          </div>
        </div>

        {/* Consultation Details */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FaClipboardList className="text-blue-500" />
            Consultation Notes
          </h4>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              {appointment.notes || 'No consultation notes available'}
            </p>
          </div>
        </div>

        {/* Expandable Section */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            {isExpanded ? (
              <>
                <FaChevronUp className="text-blue-500" />
                Show less details
              </>
            ) : (
              <>
                <FaChevronDown className="text-blue-500" />
                Show more details
              </>
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-4"
              >
                {/* Patient Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Patient Information</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span><br />
                        {appointment.email || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Phone:</span><br />
                        {appointment.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Age:</span><br />
                        {appointment.age || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Gender:</span><br />
                        {appointment.gender || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medical History */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Medical History</h5>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Previous Conditions:</span><br />
                      {appointment.medicalHistory?.conditions || 'No previous conditions recorded'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Allergies:</span><br />
                      {appointment.medicalHistory?.allergies || 'No allergies recorded'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Current Medications:</span><br />
                      {appointment.medicalHistory?.medications || 'No current medications'}
                    </p>
                  </div>
                </div>

                {/* Appointment History */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Appointment History</h5>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Previous Visits:</span> {appointment.visitCount || '0'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Last Visit:</span><br />
                      {appointment.lastVisit || 'First visit'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// Update PropTypes to include new fields
EnhancedAppointmentCard.propTypes = {
  appointment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    patientName: PropTypes.string.isRequired,
    email: PropTypes.string,
    phone: PropTypes.string,
    age: PropTypes.string,
    gender: PropTypes.string,
    times: PropTypes.arrayOf(PropTypes.string).isRequired,
    date: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    type: PropTypes.string,
    doctor: PropTypes.string,
    notes: PropTypes.string,
    roomId: PropTypes.string,
    visitCount: PropTypes.number,
    lastVisit: PropTypes.string,
    medicalHistory: PropTypes.shape({
      conditions: PropTypes.string,
      allergies: PropTypes.string,
      medications: PropTypes.string
    }),
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  handleChatAction: PropTypes.func.isRequired
};

// Add this helper function to get the next appointment
const getNextAppointment = (appointments) => {
  const now = new Date();
  return appointments
    .filter(app => {
      const appDateTime = new Date(app.date);
      const [hours, minutes] = app.times[0].split(':');
      appDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
      return appDateTime > now && app.status === 'pending';
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const [hoursA, minutesA] = a.times[0].split(':');
      const [hoursB, minutesB] = b.times[0].split(':');
      dateA.setHours(parseInt(hoursA), parseInt(minutesA), 0);
      dateB.setHours(parseInt(hoursB), parseInt(minutesB), 0);
      return dateA - dateB;
    })[0];
};

// Update the Next Appointment Card
const NextAppointmentCard = ({ appointments, handleChatAction }) => {
  const nextAppointment = getNextAppointment(appointments);

  const handleEnterRoom = () => {
    if (nextAppointment) {
      handleChatAction(nextAppointment);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTimeRemaining = (appointmentDate, appointmentTime) => {
    const now = new Date();
    const [hours, minutes] = appointmentTime.split(':');
    const appointment = new Date(appointmentDate);
    appointment.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const diff = appointment - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const endTime = new Date(appointment);
    endTime.setHours(endTime.getHours() + 1);

    if (now >= appointment && now < endTime) {
      const remainingMins = Math.floor((endTime - now) / (1000 * 60));
      return `${remainingMins} minutes remaining in session`;
    }

    if (days > 0) return `${days} days remaining`;
    if (hrs > 0) return `${hrs} hours remaining`;
    if (mins > 0) return `${mins} minutes remaining`;
    return 'Starting soon';
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg mt-4 border border-blue-200"
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
      }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500 rounded-lg">
            <FaStethoscope className="text-2xl text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium text-blue-900">Next Appointment</h3>
            <p className="text-xs text-blue-600 mt-1">Upcoming consultation</p>
          </div>
        </div>
        {nextAppointment && (
          <motion.button
            onClick={handleEnterRoom}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Enter Room
            <FaArrowRight />
          </motion.button>
        )}
      </div>

      {nextAppointment ? (
        <motion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Patient Info Section */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
              <FaUser className="text-blue-600 text-2xl" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-800">{nextAppointment.patientName}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(nextAppointment.status)}`}>
                  {nextAppointment.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">{nextAppointment.email || 'No email provided'}</p>
              <p className="text-xs text-blue-600 mt-1">
                Patient ID: #{nextAppointment.id?.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Consultation Details */}
          <div className="bg-white/50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-gray-700 mb-2">
              <FaUserMd className="text-blue-500" />
              <span className="font-medium">Consultation Details</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Doctor</p>
                <p className="font-medium text-gray-800">
                  {nextAppointment.doctor || 'Dr. Assigned'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Consultation Type</p>
                <p className="font-medium text-gray-800">
                  {nextAppointment.consultationType || 'General Checkup'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Time and Date Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FaCalendarAlt className="text-blue-500" />
                <span className="text-sm font-medium">Schedule</span>
              </div>
              <p className="text-gray-800 font-medium">
                {new Date(nextAppointment.date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {getTimeRemaining(nextAppointment.date, nextAppointment.times[0])}
              </p>
            </div>
            <div className="bg-white/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <FaClock className="text-blue-500" />
                <span className="text-sm font-medium">Time Slot</span>
              </div>
              <p className="text-gray-800 font-medium">
                {nextAppointment.times[0]}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Duration: 60 minutes
              </p>
            </div>
          </div>

          {/* Additional Notes */}
          {nextAppointment.notes && (
            <div className="mt-4 bg-white/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <FaClipboardList className="text-blue-500" />
                <span className="font-medium">Notes</span>
              </div>
              <p className="text-sm text-gray-600">
                {nextAppointment.notes}
              </p>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="mt-4 text-center py-8 bg-white/50 rounded-lg">
          <FaCalendarAlt className="text-blue-300 text-4xl mx-auto mb-3" />
          <p className="text-gray-700 font-medium">No upcoming appointments</p>
          <p className="text-sm text-gray-500 mt-1">Your schedule is clear for now</p>
        </div>
      )}
    </motion.div>
  );
};

// Update PropTypes to include new fields
NextAppointmentCard.propTypes = {
  appointments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    patientName: PropTypes.string.isRequired,
    email: PropTypes.string,
    times: PropTypes.arrayOf(PropTypes.string).isRequired,
    date: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    roomId: PropTypes.string,
    doctor: PropTypes.string,
    consultationType: PropTypes.string,
    notes: PropTypes.string
  })).isRequired,
  handleChatAction: PropTypes.func.isRequired
};

// Add these helper functions at the top of your file
const calculateMonthlyEarnings = (appointments) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  return appointments
    .filter(app => {
      const appDate = new Date(app.date);
      return appDate.getMonth() === currentMonth && 
             appDate.getFullYear() === currentYear;
    })
    .reduce((total, app) => total + (app.totalAmount || 0), 0);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Update the Total Earnings Card component
const TotalEarningsCard = ({ appointments, completedConsultations }) => {
  const MONTHLY_TARGET = 1000000; // Rp 1,000,000
  const monthlyEarnings = calculateMonthlyEarnings(appointments);
  const progressPercentage = Math.min(Math.round((monthlyEarnings / MONTHLY_TARGET) * 100), 100);
  
  const currentMonthName = new Date().toLocaleDateString('id-ID', { month: 'long' });

  return (
    <motion.div
      className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 shadow-lg mt-4 border border-emerald-200"
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
      }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500 rounded-lg">
            <FaChartLine className="text-2xl text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium text-emerald-900">Total Earnings</h3>
            <p className="text-xs text-emerald-600 mt-1">{currentMonthName}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <FaMoneyBillWave />
            <span className="text-sm font-medium">Monthly Revenue</span>
          </div>
          <motion.h4 
            className="text-2xl font-bold text-gray-800"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {formatCurrency(monthlyEarnings)}
          </motion.h4>
          <p className="text-xs text-emerald-600 mt-2">
            From {appointments.filter(app => {
              const appDate = new Date(app.date);
              return appDate.getMonth() === new Date().getMonth();
            }).length} consultations
          </p>
        </div>

        <div className="bg-white/50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <FaUserMd />
            <span className="text-sm font-medium">Success Rate</span>
          </div>
          <motion.h4 
            className="text-2xl font-bold text-gray-800"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {appointments.length > 0 
              ? Math.round((completedConsultations / appointments.length) * 100)
              : 0}%
          </motion.h4>
          <p className="text-xs text-emerald-600 mt-2">
            {completedConsultations} completed
          </p>
        </div>
      </div>

      {/* Monthly Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Monthly Target ({formatCurrency(MONTHLY_TARGET)})</span>
          <span className="text-emerald-600 font-medium">
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-emerald-100 rounded-full h-2">
          <motion.div
            className="bg-emerald-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
        <p className="text-xs text-emerald-600 mt-2 text-right">
          {formatCurrency(MONTHLY_TARGET - monthlyEarnings)} remaining to reach target
        </p>
      </div>
    </motion.div>
  );
};

// Add PropTypes
TotalEarningsCard.propTypes = {
  appointments: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    totalAmount: PropTypes.number,
    status: PropTypes.string.isRequired
  })).isRequired,
  completedConsultations: PropTypes.number.isRequired
};

export default function Admin() {
  const [username, setUsername] = useState('')
  const [appointments, setAppointments] = useState([])
  const [messages, setMessages] = useState([])
  const [patientCount, setPatientCount] = useState(0)
  const [completedConsultations, setCompletedConsultations] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isFiltering, setIsFiltering] = useState(false)
  const [dateRange] = useState({ start: '', end: '' });
  const [timeSlot] = useState('');

  const navigate = useNavigate();

  // Combined filtering logic
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const appointmentTime = parseInt(appointment.times[0]?.split(':')[0] || '0');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    // Search term filter
    const matchesSearch = searchTerm 
      ? appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.id.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    // Status filter - Updated to handle 'today' and 'upcoming'
    const matchesStatus = () => {
      switch(filterStatus) {
        case 'today':
          return isToday(appointmentDate);
        case 'upcoming':
          // Check if date is in the future (tomorrow or later)
          return appointmentDate > today;
        case 'all':
          return true;
        default:
          return appointment.status === filterStatus;
      }
    };

    // Rest of the filtering logic remains the same
    const isInDateRange = () => {
      if (!dateRange.start && !dateRange.end) return true;
      const start = dateRange.start ? new Date(dateRange.start) : null;
      const end = dateRange.end ? new Date(dateRange.end) : null;
      
      if (start && end) {
        return appointmentDate >= start && appointmentDate <= end;
      }
      if (start) return appointmentDate >= start;
      if (end) return appointmentDate <= end;
      return true;
    };

    const isInTimeSlot = () => {
      if (!timeSlot) return true;
      switch(timeSlot) {
        case 'Morning':
          return appointmentTime >= 6 && appointmentTime < 12;
        case 'Afternoon':
          return appointmentTime >= 12 && appointmentTime < 17;
        case 'Evening':
          return appointmentTime >= 17;
        default:
          return true;
      }
    };

    return matchesSearch && matchesStatus() && isInDateRange() && isInTimeSlot();
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          // Get user data from Firestore instead of auth
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.username || 'Admin'); // Get username from Firestore
            console.log("Fetched username:", userData.username); // Debug log
          } else {
            console.log("No user document found");
            setUsername('Admin');
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
          console.error("Error fetching user data:", error);
          setUsername('Admin'); // Fallback
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleChatAction = async (appointment) => {
    try {
      navigate(`/ruang-konsultasi/${appointment.roomId}`, {
        state: {
          appointmentId: appointment.id,
          patientName: appointment.patientName,
          doctorName: appointment.doctor || auth.currentUser.displayName || 'Doctor',
          appointmentDetails: {
            date: appointment.date,
            time: Array.isArray(appointment.times) ? appointment.times[0] : appointment.time,
            status: appointment.status,
            patientId: appointment.patientId || appointment.userId,
            doctorId: auth.currentUser?.uid
          }
        }
      });
    } catch (error) {
      console.error('Error joining chat:', error);
      alert(`Gagal: ${error.message}`);
    }
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
      className="min-h-screen bg-gradient-to-b from-[#8e94f2] to-[#1e4287] p-4 md:p-8 text-white font-jakarta custom-scrollbar"
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
          Halo Selamat datang, {}
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
          className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          {/* Header with Stats */}
          <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Upcoming Schedule
              </h2>
              <p className="text-gray-500 mt-1">Manage your appointments and consultations</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-50 rounded-xl p-3 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-blue-600">{patientCount}</div>
                <div className="text-xs text-gray-600">Today&apos;s Patients</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center min-w-[100px]">
                <div className="text-2xl font-bold text-purple-600">{appointments.length}</div>
                <div className="text-xs text-gray-600">Total Scheduled</div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search patients, appointments, or IDs..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border-2 border-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsFiltering(!isFiltering)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2
                    ${isFiltering 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <FaFilter className={isFiltering ? 'text-white' : 'text-gray-400'} />
                  <span>Filter</span>
                </motion.button>
                
                {/* Quick Filter Buttons */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 rounded-xl bg-white text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                  onClick={() => setFilterStatus('today')}
                >
                  Today
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 rounded-xl bg-white text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                  onClick={() => setFilterStatus('upcoming')}
                >
                  Upcoming
                </motion.button>
              </div>
            </div>

            {/* Expanded Filter Options */}
            <AnimatePresence>
              {isFiltering && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status Filter */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700">Status</h3>
                      <div className="flex flex-wrap gap-2">
                        {['all', 'pending', 'completed', 'cancelled'].map((status) => (
                          <motion.button
                            key={status}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                              ${filterStatus === status
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                status === 'pending' ? 'bg-yellow-400' :
                                status === 'completed' ? 'bg-green-400' :
                                status === 'cancelled' ? 'bg-red-400' :
                                'bg-blue-400'
                              }`} />
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700">Date Range</h3>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                          type="date"
                          className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Appointments List */}
          <LayoutGroup>
            <motion.div
              layout
              className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
            >
              {filteredAppointments.length === 0 ? (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FaCalendarAlt className="text-4xl text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {searchTerm ? 'No matching appointments' : 'No appointments scheduled'}
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    {searchTerm 
                      ? 'Try adjusting your search terms or filters'
                      : 'When new appointments are scheduled, they&apos;ll appear here'
                    }
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Date Sections */}
                  {['Today', 'Tomorrow', 'Upcoming'].map((section) => {
                    const sectionAppointments = filteredAppointments.filter(app => {
                      const appDate = new Date(app.date);
                      if (section === 'Today') return isToday(appDate);
                      if (section === 'Tomorrow') return isTomorrow(appDate);
                      return !isToday(appDate) && !isTomorrow(appDate);
                    });

                    if (sectionAppointments.length === 0) return null;

                    return (
                      <div key={section}>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">{section}</h3>
                        <div className="space-y-4">
                          {sectionAppointments.map((appointment, index) => (
                            <EnhancedAppointmentCard
                              key={appointment.id}
                              appointment={appointment}
                              handleChatAction={handleChatAction}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </LayoutGroup>
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

            {/* Next Appointment Card */}
            <NextAppointmentCard 
              appointments={appointments}
              handleChatAction={handleChatAction}
            />

            {/* Total Earnings Card */}
            <TotalEarningsCard 
              appointments={appointments}
              completedConsultations={completedConsultations}
            />

            {/* Performance Analytics Card */}
            <motion.div
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-lg mt-4 border border-purple-200"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500 rounded-lg">
                    <FaHospital className="text-2xl text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-purple-900">Performance Analytics</h3>
                    <p className="text-xs text-purple-600 mt-1">Daily overview</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <FaUser />
                    <span className="text-sm font-medium">New Patients</span>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800">
                    {patientCount}
                  </h4>
                  <p className="text-xs text-purple-600 mt-2">Today</p>
                </div>

                <div className="bg-white/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <FaCalendarAlt />
                    <span className="text-sm font-medium">Appointments</span>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800">
                    {appointments.length}
                  </h4>
                  <p className="text-xs text-purple-600 mt-2">Total</p>
                </div>

                <div className="bg-white/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <FaComments />
                    <span className="text-sm font-medium">Messages</span>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800">
                    {messages.length}
                  </h4>
                  <p className="text-xs text-purple-600 mt-2">Unread</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
