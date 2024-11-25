import { ref, push, set, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { realtimeDb } from '../firebase';

// Format date for Firestore
const formatDateForFirestore = (date) => {
  if (!date) return null;
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
};

// Get booked slots
export const getBookedSlots = (selectedDate, selectedDoctor, callback) => {
  if (!selectedDate || !selectedDoctor) return;

  const dateString = formatDateForFirestore(selectedDate);
  const appointmentsRef = ref(realtimeDb, 'appointments');
  
  // Query appointments for the selected doctor
  const appointmentsQuery = query(
    appointmentsRef,
    orderByChild('doctor'),
    equalTo(selectedDoctor)
  );

  return onValue(appointmentsQuery, (snapshot) => {
    const booked = {};
    
    snapshot.forEach((childSnapshot) => {
      const appointment = childSnapshot.val();
      
      // Check if the appointment is for the selected date
      if (appointment.date && appointment.date.split('T')[0] === dateString) {
        // If times is an array, mark each time slot as booked
        if (Array.isArray(appointment.times)) {
          appointment.times.forEach((time) => {
            booked[time] = {
              isBooked: true,
              appointmentId: childSnapshot.key,
              patientName: appointment.patientName,
              status: appointment.status
            };
          });
        }
      }
    });

    callback(booked);
  });
};

// Save appointment with the structure from konsultasi.jsx
export const saveAppointment = async (bookingData) => {
  try {
    const appointmentsRef = ref(realtimeDb, 'appointments');
    const newAppointmentRef = push(appointmentsRef);
    
    // Format the booking data
    const formattedData = {
      date: bookingData.date,
      times: bookingData.times,
      doctor: bookingData.doctor,
      userId: bookingData.userId,
      patientName: bookingData.patientName,
      paymentMethod: bookingData.paymentMethod,
      quantity: bookingData.times.length,
      pricePerSession: bookingData.pricePerSession,
      totalAmount: bookingData.totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      metadata: {
        createdBy: bookingData.userId,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    };

    await set(newAppointmentRef, formattedData);
    return newAppointmentRef.key;
  } catch (error) {
    console.error('Error saving appointment:', error);
    throw error;
  }
};

// Validate booking data
export const validateBookingData = (bookingData) => {
  const { selectedDate, selectedTimes, selectedDoctor, selectedPayment } = bookingData;
  const errors = [];
  
  if (!selectedDate) errors.push('Tanggal harus dipilih');
  if (!selectedTimes.length) errors.push('Waktu konsultasi harus dipilih');
  if (!selectedDoctor) errors.push('Dokter harus dipilih');
  if (!selectedPayment) errors.push('Metode pembayaran harus dipilih');
  
  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
  
  return true;
};

// Create booking data object
export const createBookingData = (data) => {
  const { selectedDate, selectedTimes, selectedDoctor, selectedPayment, user, CONSULTATION_PRICE } = data;
  
  return {
    date: selectedDate.toISOString(),
    times: selectedTimes,
    doctor: selectedDoctor,
    userId: user?.uid || 'guest',
    patientName: user?.displayName || 'Guest Patient',
    paymentMethod: selectedPayment,
    quantity: selectedTimes.length,
    pricePerSession: CONSULTATION_PRICE,
    totalAmount: CONSULTATION_PRICE * selectedTimes.length,
    status: 'pending',
    createdAt: new Date().toISOString(),
    tags: ['New', 'Consultation'],
    metadata: {
      createdBy: user?.uid || 'guest',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }
  };
}; 