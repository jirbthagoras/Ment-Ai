import { ref, onValue, update } from 'firebase/database';
import { realtimeDb } from '../firebase';
import { createChatRoom, checkChatRoomExists } from './chatService';

// Get active appointments from Realtime Database
export const getActiveAppointments = (callback) => {
  try {
    const appointmentsRef = ref(realtimeDb, 'appointments');
    
    // Create a query for active appointments
    return onValue(appointmentsRef, (snapshot) => {
      const appointments = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        if (data.status !== 'completed') {
          appointments.push({
            id: childSnapshot.key,
            userId: data.userId,
            patientId: data.userId, // Map userId to patientId
            patientName: data.patientName,
            doctor: data.doctor,
            date: data.date,
            times: Array.isArray(data.times) ? data.times : [data.time],
            status: data.status,
            ...data
          });
        }
      });

      // Sort appointments by date (most recent first)
      appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      console.log('Fetched appointments:', appointments); // Debug log
      callback(appointments);
    });
  } catch (error) {
    console.error('Error setting up appointments listener:', error);
    return () => {};
  }
};

// Get messages
export const getMessages = (callback) => {
  const messagesRef = ref(realtimeDb, 'messages');
  return onValue(messagesRef, (snapshot) => {
    const messages = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(messages);
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

// Get user data
export const getUserData = async (uid) => {
  try {
    const userRef = ref(realtimeDb, `users/${uid}`);
    return new Promise((resolve, reject) => {
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        resolve(userData);
      }, {
        onlyOnce: true
      }, reject);
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

// Filter active appointments
export const filterActiveAppointments = (appointments, searchTerm, filterStatus) => {
  return appointments.filter(appointment => {
    const matchesSearch = appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
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

// Filter appointments based on search term and status
export const filterAppointments = (appointments, searchTerm, filterStatus) => {
  return appointments.filter(appointment => {
    const matchesSearch = appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
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

// Check chat room status for appointments
export const checkAppointmentChatRooms = async (appointments) => {
  const status = {};
  for (const appointment of appointments) {
    try {
      status[appointment.id] = await checkChatRoomExists(appointment.id);
    } catch (error) {
      console.error(`Error checking chat room for ${appointment.id}:`, error);
      status[appointment.id] = false;
    }
  }
  return status;
};

// Handle chat room creation and updates
export const handleChatRoomCreation = async (appointment, currentUser) => {
  try {
    if (!isAppointmentToday(appointment.date)) {
      throw new Error('Ruang konsultasi hanya dapat dibuat pada hari yang sama dengan jadwal konsultasi.');
    }

    // Create consultation room
    const roomData = {
      appointmentId: appointment.id,
      doctorId: currentUser.uid,
      patientId: appointment.patientId || appointment.userId,
      doctorName: appointment.doctor || currentUser.displayName || 'Doctor',
      patientName: appointment.patientName || 'Patient',
      scheduledTime: Array.isArray(appointment.times) ? appointment.times[0] : appointment.time,
      scheduledDate: appointment.date,
      status: 'ready',
      createdAt: new Date().toISOString()
    };

    // Create the chat room
    await createChatRoom(roomData);

    // Update appointment with room status
    const appointmentRef = ref(realtimeDb, `appointments/${appointment.id}`);
    await update(appointmentRef, {
      hasRoom: true,
      roomCreatedAt: new Date().toISOString(),
      roomCreatedBy: currentUser.uid,
      roomStatus: 'ready',
      status: 'ready',
      notification: {
        type: 'room_created',
        message: 'Ruang konsultasi telah dibuat oleh dokter',
        timestamp: new Date().toISOString()
      }
    });

    return {
      success: true,
      appointmentId: appointment.id,
      patientName: appointment.patientName,
      doctorName: appointment.doctor || currentUser.displayName || 'Doctor',
      appointmentDetails: {
        date: appointment.date,
        time: Array.isArray(appointment.times) ? appointment.times[0] : appointment.time,
        status: 'ready',
        patientId: appointment.patientId || appointment.userId,
        doctorId: currentUser?.uid
      }
    };
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
};

// Helper function to check if appointment is today
export const isAppointmentToday = (appointmentDate) => {
  const today = new Date();
  const appDate = new Date(appointmentDate);
  return today.toISOString().split('T')[0] === appDate.toISOString().split('T')[0];
};

// Setup real-time listeners for appointments
export const setupAppointmentListeners = (callbacks) => {
  const unsubscribe = {};

  // Get active appointments
  unsubscribe.appointments = getActiveAppointments((appointments) => {
    callbacks.onAppointmentsUpdate(appointments);
  });

  // Get messages
  unsubscribe.messages = getMessages((messages) => {
    callbacks.onMessagesUpdate(messages);
  });

  // Get today's appointments count
  unsubscribe.todayCount = getTodayAppointments((count) => {
    callbacks.onTodayCountUpdate(count);
  });

  return () => {
    Object.values(unsubscribe).forEach(unsub => {
      if (typeof unsub === 'function') unsub();
    });
  };
}; 