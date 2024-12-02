import { useState, useEffect } from 'react';
import { auth } from '../../../firebase';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, set, push } from 'firebase/database';
import { realtimeDb } from '../../../firebase';
import PropTypes from 'prop-types';
import { fetchUserProfile, updateUserProfile, setupConsultationListener } from '../../../services/profileService';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaClock, FaCalendarAlt, FaPlay, FaStethoscope, FaClinicMedical, FaChevronUp, FaChevronDown, FaHourglassHalf, FaUserMd } from 'react-icons/fa';
import { id } from 'date-fns/locale';

// Add this helper function at the top of the file
const isPastConsultation = (consultationDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  const consultDate = new Date(consultationDate);
  consultDate.setHours(0, 0, 0, 0);
  return consultDate < today;
};

// Add this new component for the consultation room button
const ConsultationRoomButton = ({ consultation }) => {
  const navigate = useNavigate();

  const handleJoinRoom = async () => {
    try {
      if (consultation.status === 'completed') {
        alert('Konsultasi telah selesai');
        return;
      }

      // Navigate to consultation room
      navigate(`/ruang-konsultasi-user/${consultation.id}`, {
        state: {
          appointmentId: consultation.id,
          doctorName: consultation.doctor,
          appointmentDetails: {
            date: consultation.date,
            time: Array.isArray(consultation.times) ? consultation.times[0] : consultation.time,
            status: consultation.status,
            patientId: auth.currentUser.uid,
            patientName: auth.currentUser.displayName || 'Patient'
          }
        }
      });
    } catch (err) {
      console.error('Error joining room:', err);
    }
  };

  const getButtonStyle = () => {
    return consultation.status === 'completed'
      ? 'bg-gray-500 hover:bg-gray-600 cursor-not-allowed'
      : 'bg-blue-600 hover:bg-blue-700';
  };

  const getButtonText = () => {
    return consultation.status === 'completed'
      ? 'Konsultasi Selesai'
      : 'Masuk ke Ruang Konsultasi';
  };

  return (
    <motion.button
      whileHover={{ scale: consultation.status !== 'completed' ? 1.05 : 1 }}
      whileTap={{ scale: consultation.status !== 'completed' ? 0.95 : 1 }}
      onClick={handleJoinRoom}
      disabled={consultation.status === 'completed'}
      className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-all duration-200 ${getButtonStyle()}`}
    >
      {getButtonText()}
    </motion.button>
  );
};

ConsultationRoomButton.propTypes = {
  consultation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    times: PropTypes.arrayOf(PropTypes.string),
    time: PropTypes.string,
    patientName: PropTypes.string,
    doctor: PropTypes.string,
    status: PropTypes.string
  }).isRequired
};

// Add this new component for the Booking Card
const BookingCard = ({ consultation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusTag = () => {
    const statusConfig = {
      completed: { 
        text: 'Selesai', 
        style: 'bg-green-100 text-green-800 border-green-300',
        icon: <FaCheckCircle className="text-green-500" />
      },
      'in-progress': { 
        text: 'Konsultasi Berlangsung', 
        style: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: <FaClock className="text-yellow-500" />
      },
      ready: { 
        text: 'Siap Dimulai', 
        style: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: <FaPlay className="text-blue-500" />
      },
      pending: { 
        text: 'Menunggu', 
        style: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: <FaHourglassHalf className="text-gray-500" />
      }
    };
    return statusConfig[consultation.status] || statusConfig.pending;
  };

  const getTimeRemaining = (consultationDate, consultationTime) => {
    const now = new Date();
    const [hours, minutes] = consultationTime.split(':');
    const consultation = new Date(consultationDate);
    consultation.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const endTime = new Date(consultation);
    endTime.setHours(endTime.getHours() + 1); // 60-minute session

    if (now >= consultation && now < endTime) {
      const remainingMins = Math.floor((endTime - now) / (1000 * 60));
      return `${remainingMins} menit tersisa`;
    }

    const diff = consultation - now;
    if (diff < 0) return 'Sesi telah berakhir';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `Dimulai dalam ${days} hari`;
    if (hrs > 0) return `Dimulai dalam ${hrs} jam`;
    if (mins > 0) return `Dimulai dalam ${mins} menit`;
    return 'Akan segera dimulai';
  };

  const { text, style, icon } = getStatusTag();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Header Section */}
      <div className="p-5 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <FaUserMd className="text-2xl text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Konsultasi dengan {consultation.doctor}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <FaCalendarAlt className="text-blue-500" />
                {format(new Date(consultation.date), 'EEEE, dd MMMM yyyy', { locale: id })}
              </div>
            </div>
          </div>
          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${style}`}>
            {icon}
            {text}
          </span>
        </div>

        {/* Time and Session Info */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/60 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-700 mb-1">
              <FaClock className="text-blue-500" />
              <span className="font-medium">Waktu Sesi</span>
            </div>
            <p className="text-gray-800">
              {Array.isArray(consultation.times) ? consultation.times[0] : consultation.time}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Durasi: 60 menit
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-700 mb-1">
              <FaHourglassHalf className="text-blue-500" />
              <span className="font-medium">Status Waktu</span>
            </div>
            <p className="text-gray-800">
              {getTimeRemaining(consultation.date, Array.isArray(consultation.times) ? consultation.times[0] : consultation.time)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5">
        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-700 mb-1">
              <FaStethoscope className="text-blue-500" />
              <span className="font-medium">Jenis Konsultasi</span>
            </div>
            <p className="text-gray-800">
              {consultation.type || 'Konsultasi Umum'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-700 mb-1">
              <FaClinicMedical className="text-blue-500" />
              <span className="font-medium">Ruang Konsultasi</span>
            </div>
            <p className="text-gray-800">
              #{consultation.roomId?.slice(0, 6) || 'Sesi Belum Tersedia'}
            </p>
          </div>
        </div>

        {/* Expandable Section */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800"
          >
            {isExpanded ? (
              <>
                <FaChevronUp className="text-blue-500" />
                Sembunyikan detail
              </>
            ) : (
              <>
                <FaChevronDown className="text-blue-500" />
                Lihat detail
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
                {/* Consultation Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Detail Konsultasi</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Keluhan:</span><br />
                      {consultation.complaints || 'Tidak ada keluhan yang dicatat'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Catatan Dokter:</span><br />
                      {consultation.doctorNotes || 'Belum ada catatan dari dokter'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Rekomendasi:</span><br />
                      {consultation.recommendations || 'Belum ada rekomendasi'}
                    </p>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Informasi Tambahan</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Dibuat pada:</span><br />
                        {format(new Date(consultation.createdAt || Date.now()), 'dd MMM yyyy HH:mm', { locale: id })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Terakhir diupdate:</span><br />
                        {consultation.updatedAt ? 
                          format(new Date(consultation.updatedAt), 'dd MMM yyyy HH:mm', { locale: id }) : 
                          'Belum ada update'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <ConsultationRoomButton consultation={consultation} />
        </div>
      </div>
    </motion.div>
  );
};

// Update PropTypes
BookingCard.propTypes = {
  consultation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    doctor: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    times: PropTypes.arrayOf(PropTypes.string),
    time: PropTypes.string,
    status: PropTypes.string.isRequired,
    type: PropTypes.string,
    roomId: PropTypes.string,
    complaints: PropTypes.string,
    doctorNotes: PropTypes.string,
    recommendations: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
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
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [error, setError] = useState(null);
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
      const userData = await fetchUserProfile();
      setUser(prev => ({
        ...prev,
        ...userData
      }));
    } catch (err) {
      setError('Failed to load profile data: ' + err.message);
      console.error('Error fetching user data:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await updateUserProfile(user);
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

      // Generate unique room ID
      const roomId = `room_${Date.now()}_${currentUser.uid}`;

      const bookingData = {
        date: selectedDate.toISOString(),
        time: selectedTime,
        doctor: selectedDoctor,
        userId: currentUser.uid,
        patientName: currentUser.displayName,
        status: 'pending',
        createdAt: new Date().toISOString(),
        hasRoom: true, // Room is created automatically
        roomId: roomId,
        roomStatus: 'ready'
      };

      // Save appointment to Realtime Database
      const appointmentsRef = ref(realtimeDb, 'appointments');
      const newAppointmentRef = push(appointmentsRef);
      await set(newAppointmentRef, bookingData);

      // Create consultation room
      const roomRef = ref(realtimeDb, `consultation-rooms/${roomId}`);
      await set(roomRef, {
        appointmentId: newAppointmentRef.key,
        doctorId: selectedDoctor,
        patientId: currentUser.uid,
        patientName: currentUser.displayName || 'Patient',
        status: 'ready',
        createdAt: new Date().toISOString(),
        messages: [],
        participants: {}
      });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
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
        {recentActivity.filter(consultation => 
          !isPastConsultation(consultation.date) || consultation.status === 'completed'
        ).length > 0 ? (
          recentActivity
            .filter(consultation => 
              !isPastConsultation(consultation.date) || consultation.status === 'completed'
            )
            .map((consultation) => (
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
    // Only show future consultations
    const futureConsultations = upcomingConsultations.filter(consultation => 
      !isPastConsultation(consultation.date)
    );

    if (futureConsultations.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4 text-gray-500"
        >
          Belum ada konsultasi mendatang
        </motion.div>
      );
    }

    return futureConsultations.map(consultation => (
      <BookingCard
        key={consultation.id}
        consultation={consultation}
      />
    ));
  };

  // Update the renderConsultationHistory function
  const renderConsultationHistory = () => {
    // Filter out past consultations that aren't marked as completed
    const validConsultations = consultationHistory.filter(consultation => 
      !isPastConsultation(consultation.date) || consultation.status === 'completed'
    );

    if (!validConsultations.length) {
      return (
        <div className="text-center text-gray-500 py-4">
          Belum ada riwayat konsultasi
        </div>
      );
    }

    return validConsultations.map(consultation => (
      <BookingCard
        key={consultation.id}
        consultation={consultation}
      />
    ));
  };

  // Separate auth check effect
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthChecked(true);
      if (!user) {
        setIsLoading(false);
        setError('Please log in to view profile');
      }
    });

    return () => unsubscribe();
  }, []);

  // Separate data fetching effect
  useEffect(() => {
    if (!isAuthChecked || !auth.currentUser) return;

    const loadUserData = async () => {
      try {
        setIsLoading(true);
        await fetchUserData();
        
        // Setup consultation listener
        const unsubscribe = setupConsultationListener({
          onConsultationHistory: setConsultationHistory,
          onUpcomingConsultations: setUpcomingConsultations,
          onRecentActivity: setRecentActivity,
          onStats: setStats
        });

        setIsLoading(false);
        
        return () => {
          if (unsubscribe) {
            unsubscribe();
          }
        };
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load profile data');
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [isAuthChecked]);

  // Loading state with timeout
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError('Loading took too long. Please refresh the page.');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(loadingTimeout);
  }, [isLoading]);

  if (!isAuthChecked) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-b-2 border-blue-500 rounded-full"
        />
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Please Log In
          </h2>
          <p className="text-gray-600">
            You need to be logged in to view your profile.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-4">
            Error Loading Profile
          </h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-b-2 border-blue-500 rounded-full"
        />
      </div>
    );
  }

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