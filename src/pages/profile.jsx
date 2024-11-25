import { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { format, addMinutes, subMinutes, isWithinInterval } from 'date-fns';
import { motion } from 'framer-motion';
import { ref, set, orderByChild, equalTo, onValue, query as dbQuery } from 'firebase/database';
import { realtimeDb } from '../firebase';
import PropTypes from 'prop-types';

// Add this new component for the consultation room button
const ConsultationRoomButton = ({ consultation }) => {
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  
  useEffect(() => {
    const checkTimeWindow = () => {
      const now = new Date();
      const consultTime = new Date(`${consultation.date}T${consultation.time}`);
      const windowStart = subMinutes(consultTime, 5);
      const windowEnd = addMinutes(consultTime, 60); // 1-hour session

      setIsWithinWindow(isWithinInterval(now, { start: windowStart, end: windowEnd }));
    };

    checkTimeWindow();
    const interval = setInterval(checkTimeWindow, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [consultation]);

  const handleJoinRoom = () => {
    window.location.href = `/consultation-room/${consultation.id}`;
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleJoinRoom}
      disabled={!isWithinWindow}
      className={`w-full py-2 px-4 rounded-lg text-white font-medium
        ${isWithinWindow 
          ? 'bg-blue-600 hover:bg-blue-700' 
          : 'bg-gray-300 cursor-not-allowed'}`}
    >
      {isWithinWindow ? 'Bergabung ke Ruangan Konsultasi' : 'Ruangan tidak tersedia'}
    </motion.button>
  );
};

ConsultationRoomButton.propTypes = {
  consultation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired
  }).isRequired
};

// Add this new component for the Booking Card
const BookingCard = ({ consultation }) => {
  const [timeStatus, setTimeStatus] = useState('not-started');
  
  // Safely parse the date
  const consultationDate = useMemo(() => {
    try {
      // Check if date is ISO string or timestamp
      const date = new Date(consultation.date);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', consultation.date);
        return new Date(); // Fallback to current date
      }
      return date;
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date(); // Fallback to current date
    }
  }, [consultation.date]);

  const isToday = useMemo(() => {
    try {
      return format(consultationDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error comparing dates:', error);
      return false;
    }
  }, [consultationDate]);

  useEffect(() => {
    const checkTimeStatus = () => {
      try {
        const now = new Date();
        const [hours, minutes] = (consultation.time || '00:00').split(':');
        const consultTime = new Date(consultationDate);
        consultTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
        
        const windowStart = subMinutes(consultTime, 5);
        const windowEnd = addMinutes(consultTime, 60);

        if (isWithinInterval(now, { start: windowStart, end: windowEnd })) {
          setTimeStatus('active');
        } else if (now > windowEnd) {
          setTimeStatus('ended');
        } else {
          setTimeStatus('not-started');
        }
      } catch (error) {
        console.error('Error checking time status:', error);
        setTimeStatus('error');
      }
    };

    checkTimeStatus();
    const interval = setInterval(checkTimeStatus, 30000);
    return () => clearInterval(interval);
  }, [consultation, consultationDate]);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-4"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Konsultasi dengan {consultation.doctor || 'Unknown Doctor'}
          </h3>
          <p className="text-sm text-gray-500">
            {(() => {
              try {
                return format(consultationDate, 'EEEE, dd MMMM yyyy')
              } catch (error) {
                console.error('Error formatting date:', error)
                return 'Invalid Date'
              }
            })()}
          </p>
          <p className="text-sm text-gray-500">
            Time: {consultation.time || 'Not specified'}
          </p>
          {consultation.totalAmount && (
            <p className="text-sm text-gray-500">
              Amount: Rp{consultation.totalAmount.toLocaleString('id-ID')}
            </p>
          )}
        </div>
        <ConsultationStatus 
          status={consultation.status} 
          timeStatus={timeStatus}
        />
      </div>

      {consultation.status === 'pending' && isToday && (
        <ConsultationRoomButton consultation={consultation} />
      )}

      {consultation.status === 'completed' && consultation.summary && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Consultation Summary</h4>
          <p className="text-sm text-gray-600">{consultation.summary}</p>
        </div>
      )}
    </motion.div>
  );
};

// Update PropTypes to make some fields optional
BookingCard.propTypes = {
  consultation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string,
    doctor: PropTypes.string,
    status: PropTypes.string,
    totalAmount: PropTypes.number,
    summary: PropTypes.string
  }).isRequired
};

// Define ConsultationInfo component before the Profile component
const ConsultationInfo = () => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white p-6 rounded-2xl shadow-xl"
  >
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Konsultasi</h3>
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Dokter yang Tersedia</h4>
        <ul className="text-sm text-blue-600 space-y-2">
          <li>dr. Stevanus Ingwantoro</li>
          <li>dr. Yossy Agustanti</li>
        </ul>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2">Waktu Sesi</h4>
        <div className="text-sm text-green-600">
          <p>Pagi: 08:00 - 12:00</p>
          <p>Siang: 13:00 - 17:00</p>
        </div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-medium text-purple-900 mb-2">Catatan Penting</h4>
        <ul className="text-sm text-purple-600 space-y-1">
          <li>• Setiap sesi berlangsung 60 menit</li>
          <li>• Bergabung 5 menit sebelum waktu mulai</li>
          <li>• Pesan konsultasi melalui halaman Konsultasi</li>
        </ul>
      </div>
    </div>
  </motion.div>
);

// Add a new component for consultation status
const ConsultationStatus = ({ status, timeStatus }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'Completed'
        };
      case 'cancelled':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          label: 'Cancelled'
        };
      case 'in-progress':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          label: 'In Progress'
        };
      case 'pending':
        if (timeStatus === 'active') {
          return {
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
            label: 'Ready to Join'
          };
        } else if (timeStatus === 'ended') {
          return {
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-800',
            label: 'Missed'
          };
        } else {
          return {
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-800',
            label: 'Upcoming'
          };
        }
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          label: status
        };
    }
  };

  const { bgColor, textColor, label } = getStatusConfig();

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};

ConsultationStatus.propTypes = {
  status: PropTypes.string.isRequired,
  timeStatus: PropTypes.string.isRequired
};

export default function Profile() {
  const [user, setUser] = useState({
    username: '',
    displayName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    occupation: '',
    emergencyContact: '',
    medicalHistory: '',
    currentMedications: '',
    previousTherapy: '',
    mainConcerns: '',
  });
  
  const [consultationHistory, setConsultationHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});
  const [upcomingConsultations, setUpcomingConsultations] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    nextSession: null
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("No user is currently logged in.");
      }

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        throw new Error("User data does not exist.");
      }
      const userData = userDoc.data();

      // Update user state with merged data
      setUser(prev => ({
        ...prev,
        ...userData,
        email: currentUser.email || userData.email,
        displayName: currentUser.displayName || userData.displayName,
        username: userData.username || currentUser.displayName,
      }));

    } catch (err) {
      setError('Failed to load profile data: ' + err.message);
      console.error('Error fetching user data:', err);
    }
  };

  // Add this function to process consultation data
  const processConsultationData = (consultations) => {
    const now = new Date();
    
    // Filter and sort upcoming consultations
    const upcoming = consultations
      .filter(consultation => {
        const consultDate = new Date(consultation.date);
        return consultation.status === 'pending' && consultDate >= now;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Get recent activity (last 3 consultations of any status)
    const recent = [...consultations]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    // Calculate stats
    const stats = {
      totalSessions: consultations.length,
      nextSession: upcoming[0] || null,
      totalAmount: consultations.reduce((sum, c) => sum + (c.totalAmount || 0), 0)
    };

    return { upcoming, recent, stats };
  };

  // Update the setupConsultationListener function
  const setupConsultationListener = () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const appointmentsRef = ref(realtimeDb, 'appointments');
      const userAppointmentsQuery = dbQuery(
        appointmentsRef,
        orderByChild('userId'),
        equalTo(currentUser.uid)
      );

      return onValue(userAppointmentsQuery, (snapshot) => {
        const appointments = [];
        const slots = {};
        
        snapshot.forEach((childSnapshot) => {
          const appointment = {
            id: childSnapshot.key,
            ...childSnapshot.val()
          };
          
          // Validate appointment data
          if (appointment.date && appointment.times && appointment.doctor) {
            appointments.push({
              ...appointment,
              time: appointment.times[0], // For backward compatibility
              status: appointment.status || 'pending'
            });
            
            // Mark all time slots as booked
            appointment.times.forEach(time => {
              slots[`${appointment.date}_${time}`] = true;
            });
          }
        });

        // Process the consultation data
        const { upcoming, recent, stats } = processConsultationData(appointments);
        
        setConsultationHistory(appointments);
        setUpcomingConsultations(upcoming);
        setRecentActivity(recent);
        setStats(stats);
        setBookedSlots(slots);
      });

    } catch (err) {
      console.error('Error setting up consultation listener:', err);
      setError('Failed to setup consultation updates');
    }
  };

  // Combined useEffect for initial data loading
  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await fetchUserData();
        const consultationUnsubscribe = setupConsultationListener();
        setIsLoading(false);
        
        return () => {
          if (consultationUnsubscribe) {
            consultationUnsubscribe();
          }
        };
      } else {
        setIsLoading(false);
        setError('Please log in to view profile');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user logged in');

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: user.displayName
      });

      // Update Firestore document
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        occupation: user.occupation,
        emergencyContact: user.emergencyContact,
        medicalHistory: user.medicalHistory,
        currentMedications: user.currentMedications,
        previousTherapy: user.previousTherapy,
        mainConcerns: user.mainConcerns,
        updatedAt: new Date().toISOString()
      });

      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
      console.error('Error updating profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No authenticated user found");

      const bookingData = {
        date: selectedDate.toISOString(),
        time: selectedTime,
        doctor: selectedDoctor,
        userId: currentUser.uid,
        patientName: currentUser.displayName,
        status: 'upcoming',
        createdAt: new Date().toISOString()
      };

      // Save to Realtime Database
      const appointmentsRef = ref(realtimeDb, 'appointments');
      const newAppointmentRef = push(appointmentsRef);
      await set(newAppointmentRef, bookingData);

      // Reset form
      setSelectedDate(null);
      setSelectedTime('');
      setSelectedDoctor('');
      
      // Refresh consultation history
      fetchUserData();
    } catch (err) {
      setError('Failed to book appointment');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the handleAttendConsultation function
  const handleAttendConsultation = async (consultation) => {
    try {
      const consultationRef = ref(realtimeDb, `appointments/${consultation.id}`);
      
      // Update consultation status
      await set(consultationRef, {
        ...consultation,
        status: 'in-progress',
        metadata: {
          ...consultation.metadata,
          lastUpdated: new Date().toISOString(),
          lastUpdatedBy: auth.currentUser?.uid,
          joinedAt: new Date().toISOString()
        }
      });

      // Create consultation room data
      const roomRef = ref(realtimeDb, `consultation-rooms/${consultation.id}`);
      await set(roomRef, {
        consultationId: consultation.id,
        doctorId: consultation.doctorId,
        patientId: consultation.userId,
        status: 'active',
        startedAt: new Date().toISOString(),
        participants: {
          [consultation.userId]: {
            role: 'patient',
            joinedAt: new Date().toISOString()
          }
        },
        messages: [],
        metadata: {
          createdAt: new Date().toISOString(),
          createdBy: auth.currentUser?.uid
        }
      });

      // Replace router.push with window.location
      window.location.href = `/consultation-room/${consultation.id}`;
    } catch (err) {
      console.error('Error joining consultation:', err);
      setError('Failed to join consultation');
    }
  };

  // Update the Quick Stats Card to show more information
  const QuickStatsCard = () => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-2xl shadow-xl"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Cepat</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600">Total Sesi</p>
          <p className="text-2xl font-bold text-blue-900">
            {stats.totalSessions}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600">Sesi Berikutnya</p>
          <p className="text-sm font-medium text-green-900">
            {stats.nextSession 
              ? format(new Date(stats.nextSession.date), 'MMM d')
              : 'Belum terjadwal'}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg col-span-2">
          <p className="text-sm text-purple-600">Total Pengeluaran</p>
          <p className="text-xl font-bold text-purple-900">
            Rp{stats.totalAmount?.toLocaleString('id-ID') || '0'}
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Update the Recent Activity Card JSX
  const RecentActivityCard = () => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-2xl shadow-xl"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
      <div className="space-y-4">
        {recentActivity.length > 0 ? (
          recentActivity.map((consultation) => (
            <div key={consultation.id} className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                consultation.status === 'completed' ? 'bg-green-500' : 
                consultation.status === 'upcoming' ? 'bg-blue-500' : 
                consultation.status === 'in-progress' ? 'bg-yellow-500' : 
                'bg-gray-500'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Sesi dengan {consultation.doctor}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(consultation.date), 'PPP')} pukul {consultation.time}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center">Belum ada aktivitas</p>
        )}
      </div>
    </motion.div>
  );

  // Update the renderUpcomingConsultations function
  const renderUpcomingConsultations = () => {
    if (upcomingConsultations.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4 text-gray-500"
        >
          No upcoming consultations
        </motion.div>
      );
    }

    return upcomingConsultations.map(consultation => (
      <BookingCard
        key={consultation.id}
        consultation={consultation}
      />
    ));
  };

  const renderConsultationHistory = () => {
    if (!consultationHistory.length) {
      return (
        <div className="text-center text-gray-500 py-4">
          No consultation history available
        </div>
      );
    }

    return consultationHistory.map(consultation => (
      <BookingCard
        key={consultation.id}
        consultation={consultation}
      />
    ));
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="h-12 w-12 border-b-2 border-blue-500 rounded-full"
      />
    </div>
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-[#8e94f2] to-[#1e4287] py-12 px-4 sm:px-6 lg:px-8"
    >
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Profile Information */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 lg:w-2/3 bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Profile Header */}
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-r from-[#8e94f2] to-[#1e4287] px-8 py-6"
            >
              <div className="flex items-center space-x-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-lg"
                >
                  <span className="text-3xl text-blue-600">
                    {user.username?.charAt(0) || user.displayName?.charAt(0) || '?'}
                  </span>
                </motion.div>
                <div className="text-white">
                  <h1 className="text-2xl font-bold">{user.username || user.displayName}</h1>
                  <p className="text-blue-100">{user.email}</p>
                </div>
              </div>
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div variants={itemVariants} className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('profile')}
                  className={`${
                    activeTab === 'profile'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-8 border-b-2 font-medium text-sm transition-all duration-200`}
                >
                  Informasi Profil
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('history')}
                  className={`${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-8 border-b-2 font-medium text-sm transition-all duration-200`}
                >
                  Jadwal Konsultasi
                </motion.button>
              </nav>
            </motion.div>

            {/* Content */}
            <motion.div 
              variants={itemVariants}
              className="p-8"
            >
              {activeTab === 'profile' ? (
                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information Section */}
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                          type="text"
                          name="displayName"
                          value={user.displayName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={user.dateOfBirth}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                          name="gender"
                          value={user.gender}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Occupation</label>
                        <input
                          type="text"
                          name="occupation"
                          value={user.occupation}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Medical Information Section */}
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-900">Informasi Medis</h2>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Riwayat Medis</label>
                        <textarea
                          name="medicalHistory"
                          value={user.medicalHistory}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows="3"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Kondisi medis apa pun yang relevan..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Pengobatan Saat Ini</label>
                        <textarea
                          name="currentMedications"
                          value={user.currentMedications}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows="2"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Daftar obat apa pun saat ini..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Pengalaman Terapi Sebelumnya</label>
                        <textarea
                          name="previousTherapy"
                          value={user.previousTherapy}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows="2"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Pengalaman terapi sebelumnya..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Kekhawatiran Utama</label>
                        <textarea
                          name="mainConcerns"
                          value={user.mainConcerns}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows="3"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Apa yang membawa Anda ke terapi..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <motion.div 
                    variants={itemVariants}
                    className="flex justify-end space-x-4 pt-6"
                  >
                    {isEditing ? (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                        >
                          Batal
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                        >
                          Simpan Perubahan
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                      >
                        Ubah Profil
                      </motion.button>
                    )}
                  </motion.div>
                </motion.form>
              ) : (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-xl font-semibold text-gray-900">Jadwal Konsultasi</h2>
                  {renderConsultationHistory()}
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Right Column */}
          <motion.div variants={itemVariants} className="mt-16 lg:w-1/3 space-y-6">
            <QuickStatsCard />
            <ConsultationInfo />
            <RecentActivityCard />
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-2xl shadow-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Konsultasi Mendatang
              </h3>
              {renderUpcomingConsultations()}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}