import { ref, onValue } from 'firebase/database';
import { doc, getDoc } from 'firebase/firestore';
import { realtimeDb, db } from '../firebase';

// Get user data from Firestore
export const getUserData = async (uid) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      return userDocSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

// Get appointments from Realtime Database
export const getAppointments = (callback) => {
  const appointmentsRef = ref(realtimeDb, 'appointments');
  return onValue(appointmentsRef, (snapshot) => {
    const appointmentList = [];
    snapshot.forEach((childSnapshot) => {
      appointmentList.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(appointmentList);
  });
};

// Get messages from Realtime Database
export const getMessages = (callback) => {
  const messagesRef = ref(realtimeDb, 'messages');
  return onValue(messagesRef, (snapshot) => {
    const messagesList = [];
    snapshot.forEach((childSnapshot) => {
      messagesList.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(messagesList);
  });
};

// Get today's appointments count
export const getTodayAppointments = (callback) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const appointmentsRef = ref(realtimeDb, 'appointments');
    return onValue(appointmentsRef, (snapshot) => {
      let count = 0;
      snapshot.forEach((childSnapshot) => {
        const appointment = childSnapshot.val();
        const appointmentDate = new Date(appointment.date);
        if (appointmentDate >= startOfDay && appointmentDate <= endOfDay) {
          count++;
        }
      });
      callback(count);
    });
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    callback(0);
  }
};

// Filter appointments based on search term and status
export const filterAppointments = (appointments, searchTerm, filterStatus) => {
  return appointments.filter(appointment => {
    const matchesSearch = appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
};

// Helper function to check if appointment is expired
const isAppointmentExpired = (appointment) => {
  if (!appointment.date || !appointment.times || !appointment.times.length) {
    return false;
  }

  const today = new Date();
  const appointmentDate = new Date(appointment.date);
  
  // If the date is in the past, it's expired
  if (appointmentDate.setHours(0,0,0,0) < today.setHours(0,0,0,0)) {
    return true;
  }
  
  // If it's today, check the times
  if (appointmentDate.setHours(0,0,0,0) === today.setHours(0,0,0,0)) {
    const currentTime = new Date();
    const latestTime = appointment.times[appointment.times.length - 1];
    const [hours, minutes] = latestTime.split(':').map(Number);
    const appointmentEndTime = new Date();
    appointmentEndTime.setHours(hours, minutes, 0, 0);
    
    return currentTime > appointmentEndTime;
  }

  return false;
};

// Get active appointments (not expired)
export const getActiveAppointments = (callback) => {
  const appointmentsRef = ref(realtimeDb, 'appointments');
  return onValue(appointmentsRef, (snapshot) => {
    const appointmentList = [];
    snapshot.forEach((childSnapshot) => {
      const appointment = {
        id: childSnapshot.key,
        ...childSnapshot.val()
      };
      
      // Only include non-expired appointments
      if (!isAppointmentExpired(appointment)) {
        appointmentList.push(appointment);
      }
    });
    
    // Sort appointments by date and time
    appointmentList.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      // If same date, sort by earliest time
      const timeA = a.times[0].split(':').map(Number);
      const timeB = b.times[0].split(':').map(Number);
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
    });

    callback(appointmentList);
  });
};

// Filter active appointments
export const filterActiveAppointments = (appointments, searchTerm, filterStatus) => {
  return appointments.filter(appointment => {
    const matchesSearch = appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesFilter && !isAppointmentExpired(appointment);
  });
};

// Get appointment by ID
export const getAppointmentById = async (appointmentId) => {
  try {
    const appointmentRef = ref(realtimeDb, `appointments/${appointmentId}`);
    return new Promise((resolve, reject) => {
      onValue(appointmentRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          resolve({
            id: appointmentId,
            ...data
          });
        } else {
          resolve(null);
        }
      }, {
        onlyOnce: true
      }, reject);
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    throw error;
  }
}; 