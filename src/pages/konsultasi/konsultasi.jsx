'use client'

import { motion } from 'framer-motion'
import { FaUser, FaChevronLeft, FaChevronRight, FaCheckCircle } from 'react-icons/fa'
import { useState, useEffect, useCallback } from 'react'
import { auth } from '../../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import PropTypes from 'prop-types'
import { 
  getBookedSlots, 
  saveAppointment, 
  validateBookingData, 
  createBookingData 
} from '../../services/consultationService'

const CONSULTATION_PRICE = 25000;

export default function Konsultasi() {
  // Add states for date selection
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentStep, setPaymentStep] = useState(1);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookedSlots, setBookedSlots] = useState({});

  // Add this object for doctor schedules
  const doctorSchedules = {
    'dr. Stevanus Ingwantoro': [
      { session: 'Sesi Pagi', time: '08:00-09:00' },
      { session: 'Sesi Pagi', time: '11:00-12:00' },
      { session: 'Sesi Siang', time: '13:00-14:00' }
    ],
    'dr. Yossy Agustanti': [
      { session: 'Sesi Pagi', time: '09:00-10:00' },
      { session: 'Sesi Siang', time: '14:00-15:00' },
      { session: 'Sesi Siang', time: '15:30-16:30' }
    ]
  };

  // Format date to display
  const formatDate = (date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: months[date.getMonth()],
      year: date.getFullYear()
    }
  }

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    // Add previous month's days
    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -i)
      days.unshift({ date: prevDate, isCurrentMonth: false })
    }
    
    // Add current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }
    
    // Add next month's days to complete the calendar
    const remainingDays = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }
    
    return days
  }

  // Navigate months
  const navigateMonth = (direction) => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth)
      newMonth.setMonth(prevMonth.getMonth() + direction)
      return newMonth
    })
  }

  // Check if date is today
  const isToday = (date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  const handleTimeSelection = (time) => {
    if (bookedSlots[time]) {
      // Time slot is already booked
      return;
    }

    setSelectedTimes(prev => {
      if (prev.includes(time)) {
        return prev.filter(t => t !== time);
      } else if (prev.length < 5) {
        return [...prev, time];
      }
      return prev;
    });
  };

  const PaymentSteps = ({ currentStep }) => {
    PaymentSteps.propTypes = {
      currentStep: PropTypes.number.isRequired
    };
    
    return (
      <div className="flex justify-between items-center mb-6">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === currentStep 
                ? 'bg-[#1e4287] text-white' 
                : step < currentStep 
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
            }`}>
              {step < currentStep ? '✓' : step}
            </div>
            {step < 3 && (
              <div className={`w-20 h-1 ${
                step < currentStep ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const PaymentSection = () => {
    if (isLoading) {
      return <div>Loading...</div>;
    }

    const totalPayment = CONSULTATION_PRICE * selectedTimes.length;

    const handlePayment = async () => {
      setProcessingPayment(true);
      
      // Simulate payment processing
      setTimeout(() => {
        setProcessingPayment(false);
        setPaymentStep(2);
      }, 2000);
    };

    const confirmPayment = async () => {
      setProcessingPayment(true);
      setError(null);

      try {
        const bookingData = createBookingData({
          selectedDate,
          selectedTimes,
          selectedDoctor,
          selectedPayment,
          user,
          CONSULTATION_PRICE
        });

        const appointmentId = await saveAppointment(bookingData);
        console.log('Appointment saved with ID:', appointmentId);
        
        setProcessingPayment(false);
        setPaymentStep(3);

      } catch (error) {
        console.error('Error saving appointment:', error);
        setError('Terjadi kesalahan dalam konfirmasi pembayaran. Silakan coba lagi.');
        setProcessingPayment(false);
      }
    };

    const handlePaymentConfirmation = async () => {
      try {
        validateBookingData({
          selectedDate,
          selectedTimes,
          selectedDoctor,
          selectedPayment
        });
        await confirmPayment();
      } catch (error) {
        alert(error.message);
        setProcessingPayment(false);
      }
    };

    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PaymentSteps currentStep={paymentStep} />

        {paymentStep === 1 && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Detail Pembayaran</h3>
              <div className="text-sm space-y-2">
                <p>Total: Rp{totalPayment.toLocaleString('id-ID')}</p>
                <p>Sesi: {selectedTimes.length}x konsultasi</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPayment('BCA')}
                className={`p-4 rounded-lg border-2 ${
                  selectedPayment === 'BCA' ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img src="src\assets\logo\logobca.png" alt="BCA" className="h-8 mx-auto" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPayment('Gopay')}
                className={`p-4 rounded-lg border-2 ${
                  selectedPayment === 'Gopay' ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img src="src\assets\logo\logo-gopay-vector.png" alt="Gopay" className="h-8 mx-auto" />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayment}
              disabled={!selectedPayment || processingPayment}
              className={`w-full py-4 rounded-lg font-semibold ${
                processingPayment 
                  ? 'bg-gray-300'
                  : 'bg-[#1e4287] text-white hover:bg-[#163268]'
              }`}
            >
              {processingPayment ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : 'Bayar Sekarang'}
            </motion.button>
          </div>
        )}

        {paymentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Menunggu Pembayaran</h3>
              <p className="text-sm text-yellow-700">
                Silakan transfer ke nomor rekening berikut:
              </p>
              <div className="mt-2 p-3 bg-white rounded-lg">
                <p className="font-mono text-lg font-bold">1234-5678-9012</p>
                <p className="text-sm text-gray-600">a.n. Klinik Sehat</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePaymentConfirmation}
              disabled={processingPayment}
              className={`w-full py-4 rounded-lg font-semibold ${
                processingPayment 
                  ? 'bg-gray-300'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {processingPayment ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Confirming...
                </div>
              ) : 'Konfirmasi Pembayaran'}
            </motion.button>
          </motion.div>
        )}

        {paymentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <FaCheckCircle className="text-green-500 text-4xl" />
            </motion.div>
            <h3 className="text-xl font-bold">Pembayaran Berhasil!</h3>
            <p className="text-gray-600">Jadwal konsultasi Anda telah dikonfirmasi</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedDate(null);
                setSelectedTimes([]);
                setSelectedPayment(null);
                setPaymentStep(1);
                // Optionally redirect to home or another page
              }}
              className="w-full py-4 bg-[#1e4287] text-white rounded-lg font-semibold hover:bg-[#163268]"
            >
              Selesai
            </motion.button>
          </motion.div>
        )}

        {/* Add error message display */}
        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}
      </motion.div>
    );
  };

  // Check authentication
  useEffect(() => {
    // Check authentication
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch booked slots
  const fetchBookedSlots = useCallback((selectedDate, selectedDoctor) => {
    if (!selectedDate || !selectedDoctor) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const unsubscribe = getBookedSlots(selectedDate, selectedDoctor, (booked) => {
        setBookedSlots(booked);
        setIsLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up booked slots listener:', error);
      setError('Gagal memuat jadwal yang tersedia. Silakan coba lagi.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDate && selectedDoctor) {
      fetchBookedSlots(selectedDate, selectedDoctor);
    }
  }, [selectedDate, selectedDoctor, fetchBookedSlots]);

  // Update the renderScheduleSection to handle loading and error states
  const renderScheduleSection = () => {
    if (error) {
      return (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
          <p>{error}</p>
          <button 
            onClick={() => {
              setError(null);
              // Retry loading booked slots
              if (selectedDate && selectedDoctor) {
                fetchBookedSlots(selectedDate, selectedDoctor);
              }
            }}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Coba lagi
          </button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e4287]"></div>
        </div>
      );
    }

    return (
      <div className="mb-8">
        <h4 className="font-semibold mb-4">Pilihan Jadwal:</h4>
        <div className="space-y-3">
          {selectedDoctor && doctorSchedules[selectedDoctor].map((slot, index) => {
            const isBooked = bookedSlots[slot.time]?.isBooked;
            const bookingStatus = bookedSlots[slot.time]?.status;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                  <div>
                    <h5 className="font-medium text-gray-900">{slot.session}</h5>
                    <p className="text-sm text-gray-500">{slot.time}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTimeSelection(slot.time)}
                    disabled={isBooked}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium
                      ${isBooked 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : selectedTimes.includes(slot.time)
                          ? 'bg-[#1e4287] text-white'
                          : 'bg-blue-50 text-[#1e4287] hover:bg-blue-100'
                      }
                    `}
                  >
                    {isBooked 
                      ? `Terpesan${bookingStatus ? ` (${bookingStatus})` : ''}`
                      : selectedTimes.includes(slot.time)
                        ? 'Terpilih'
                        : 'Pilih Jadwal'
                    }
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  // Add loading state handler
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-b from-[#8e94f2] to-[#1e4287] ">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                onClick={() => setSelectedDoctor('dr. Stevanus Ingwantoro')}
                className={`relative overflow-hidden rounded-[32px] shadow-lg h-[680px] bg-[#1e4287] cursor-pointer ${
                  selectedDoctor === 'dr. Stevanus Ingwantoro' ? 'border-4 border-blue-500' : ''
                }`}
              >
                <div className="absolute inset-0">
                  <img
                    src="src\assets\doctor\dr-Stevanus.png"
                    alt="dr. Stevanus Ingwantoro, Sp.KJ"
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1e4287] via-[#1e4287]/70 to-transparent" />
                </div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3">dr. Stevanus Ingwantoro, Sp.KJ</h3>
                  <p className="text-sm mb-6 opacity-90">
                    Salah satu psikiater terbaik di Jakarta adalah dr. Stevanus, seorang psikolog dengan pengalaman lebih dari 20 tahun.
                  </p>
                  <button className="w-full bg-white text-[#1e4287] px-12 py-3 rounded-full hover:bg-gray-100 transition-colors text-lg font-semibold">
                    KONSULTASI
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6,
                  ease: "easeOut",
                  delay: 0.2
                }}
                whileHover={{ 
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                onClick={() => setSelectedDoctor('dr. Yossy Agustanti')}
                className={`relative overflow-hidden rounded-[32px] shadow-lg h-[680px] bg-[#1e4287] cursor-pointer ${
                  selectedDoctor === 'dr. Yossy Agustanti' ? 'border-4 border-blue-500' : ''
                }`}
              >
                <div className="absolute inset-0">
                  <img
                    src="src\assets\doctor\dr-yossy.jpg"
                    alt="dr. Yossy Agustanti Indradjaja, Sp.KJ"
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1e4287] via-[#1e4287]/70 to-transparent" />
                </div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3">dr. Yossy Agustanti Indradjaja, Sp.KJ</h3>
                  <p className="text-sm mb-6 opacity-90">
                    dr. Yossy adalah seorang psikiater di Jakarta yang juga merupakan anggota aktif dalam mengatasi stigma terkait kesehatan mental.
                  </p>
                  <button className="w-full bg-white text-[#1e4287] px-12 py-3 rounded-full hover:bg-gray-100 transition-colors text-lg font-semibold">
                    KONSULTASI
                  </button>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.5,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="bg-white rounded-[32px] p-6 shadow-lg mt-8"
            >
              <div className="flex items-center justify-center">
                <img
                  src="src\assets\poster.png"
                  alt="Promotional Banner"
                  className="w-full h-48 rounded-lg object-cover"
                />
              </div>
              <h3 className="text-center text-xl font-bold mt-4 text-[#1e4287]">
                DAPATKAN DISCOUNT 50% UNTUK KONSULTASI PERTAMA
              </h3>
            </motion.div>

            {/* New Community Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-r from-[#8e94f2] to-[#1e4287] rounded-[32px] p-8 shadow-lg mt-8 text-white relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-pattern transform rotate-12 scale-150" />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Ayo bergabung dengan komunitas kami!</h3>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="text-3xl"
                  >
                    👋
                  </motion.div>
                </div>

                <p className="text-lg mb-6 opacity-90">
                  Bergabunglah dengan ribuan anggota lainnya untuk berbagi pengalaman dan mendapatkan dukungan dalam perjalanan kesehatan mental Anda.
                </p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 17
                    }}
                    className="bg-white/20 rounded-2xl p-4 text-center backdrop-blur-sm"
                  >
                    <div className="text-2xl font-bold">1000+</div>
                    <div className="text-sm opacity-90">Anggota</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 17
                    }}
                    className="bg-white/20 rounded-2xl p-4 text-center backdrop-blur-sm"
                  >
                    <div className="text-2xl font-bold">50+</div>
                    <div className="text-sm opacity-90">Event</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 17
                    }}
                    className="bg-white/20 rounded-2xl p-4 text-center backdrop-blur-sm"
                  >
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm opacity-90">Support</div>
                  </motion.div>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-white text-[#1e4287] px-6 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-colors"
                  >
                    Gabung Sekarang
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-transparent border-2 border-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
                  >
                    Pelajari Lebih Lanjut
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-[32px] p-8 shadow-lg"
            >
              {/* Doctor Header */}
              <div className="flex items-center gap-4 mb-8 bg-white rounded-full p-4 shadow-sm">
                <FaUser className="text-[#1e4287] text-xl" />
                <div>
                  {selectedDoctor ? (
                    <>
                      <h2 className="text-xl font-bold text-[#1e4287]">{selectedDoctor}</h2>
                      <p className="text-gray-600">Jadwal</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-[#1e4287]">Pilih Dokter</h2>
                      <p className="text-gray-600">Silakan pilih dokter terlebih dahulu</p>
                    </>
                  )}
                </div>
              </div>

              {/* Calendar Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-[#1e4287]">
                    {formatDate(currentMonth).month} {currentMonth.getFullYear()}
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigateMonth(-1)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <FaChevronLeft className="text-[#1e4287]" />
                    </button>
                    <button 
                      onClick={() => navigateMonth(1)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <FaChevronRight className="text-[#1e4287]" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                  
                  {getDaysInMonth(currentMonth).map(({ date, isCurrentMonth }, index) => {
                    const isSelected = selectedDate && 
                      date.getDate() === selectedDate.getDate() &&
                      date.getMonth() === selectedDate.getMonth()

                    return (
                      <motion.div
                        key={`date-${index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.3,
                          delay: index * 0.02,
                          ease: "easeOut"
                        }}
                        whileHover={{ 
                          scale: 1.1,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => isCurrentMonth && setSelectedDate(date)}
                        className={`
                          p-2 m-2 text-center cursor-pointer rounded-lg transition-colors
                          ${isCurrentMonth ? 'hover:bg-blue-400' : 'opacity-30 cursor-not-allowed'}
                          ${isSelected ? 'bg-[#1e4287] text-white' : ''}
                          ${isToday(date) && !isSelected ? 'border-2 border-[#1e4287]' : ''}
                        `}
                      >
                        <span className="text-sm">{date.getDate()}</span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {renderScheduleSection()}

              {/* Payment Section */}
              {selectedDoctor && selectedDate && selectedTimes.length > 0 ? (
                <PaymentSection />
              ) : (
                <motion.div
                  className="text-center text-white p-4 rounded-lg bg-blue-600/20 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-lg">
                    {!selectedDoctor 
                      ? 'Silakan pilih dokter terlebih dahulu'
                      : !selectedDate
                      ? 'Silakan pilih tanggal konsultasi'
                      : 'Silakan pilih waktu konsultasi'}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}