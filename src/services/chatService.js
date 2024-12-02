import { 
  ref, 
  push, 
  set, 
  get,
  update,
  onValue, 
  serverTimestamp, 
  query, 
  orderByChild
} from 'firebase/database';
import { realtimeDb, auth } from '../firebase';

/**
 * Check if a chat room exists for an appointment
 */
export const checkChatRoomExists = async (appointmentId) => {
  try {
    if (!appointmentId) {
      throw new Error('Appointment ID is required');
    }

    const roomRef = ref(realtimeDb, `consultation-rooms/${appointmentId}`);
    const snapshot = await get(roomRef);
    
    if (snapshot.exists()) {
      const roomData = snapshot.val();
      return {
        exists: true,
        status: roomData.status || 'not-ready',
        data: roomData
      };
    }
    
    return {
      exists: false,
      status: 'not-created',
      data: null
    };
  } catch (error) {
    console.error('Error checking chat room:', error);
    throw error;
  }
};

/**
 * Create a new chat room for an appointment
 */
export const createChatRoom = async (roomData) => {
  try {
    // Check if appointment exists and doesn't have a room yet
    const appointmentRef = ref(realtimeDb, `appointments/${roomData.appointmentId}`);
    const appointmentSnap = await get(appointmentRef);
    
    if (!appointmentSnap.exists()) {
      throw new Error('Appointment not found');
    }
    
    const appointment = appointmentSnap.val();
    if (appointment.hasRoom) {
      throw new Error('Chat room already exists for this appointment');
    }

    // Create the chat room
    const roomRef = ref(realtimeDb, `consultation-rooms/${roomData.appointmentId}`);
    await set(roomRef, {
      ...roomData,
      messages: [],
      participants: {
        [roomData.doctorId]: {
          role: 'doctor',
          lastSeen: new Date().toISOString()
        },
        [roomData.patientId]: {
          role: 'patient',
          lastSeen: null
        }
      }
    });

    return true;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
};

/**
 * Get chat messages for a specific appointment
 */
export const getChatMessages = (appointmentId, callback) => {
  if (!appointmentId) {
    console.warn('Appointment ID is required for getting messages');
    return () => {};
  }

  const messagesRef = ref(realtimeDb, `chats/${appointmentId}/messages`);
  const messagesQuery = query(messagesRef, orderByChild('timestamp'));

  return onValue(messagesQuery, (snapshot) => {
    const messages = [];
    snapshot.forEach((childSnapshot) => {
      const message = {
        id: childSnapshot.key,
        ...childSnapshot.val(),
        timestamp: childSnapshot.val().timestamp || Date.now()
      };
      messages.push(message);
    });
    
    messages.sort((a, b) => a.timestamp - b.timestamp);
    callback(messages);
  }, (error) => {
    console.error('Error getting messages:', error);
    callback([]);
  });
};

/**
 * Send a message in the chat
 */
export const sendMessage = async (appointmentId, content, type = 'text') => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User must be authenticated');
    if (!content.trim()) throw new Error('Message content cannot be empty');

    const messagesRef = ref(realtimeDb, `chats/${appointmentId}/messages`);
    const chatRoomRef = ref(realtimeDb, `chats/${appointmentId}`);

    // Create message data
    const messageData = {
      content: content.trim(),
      type,
      timestamp: serverTimestamp(),
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'Admin',
      senderRole: 'admin',
      status: 'sent'
    };

    // Add message
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, messageData);

    // Update chat room's last message
    await update(chatRoomRef, {
      lastMessage: {
        ...messageData,
        messageId: newMessageRef.key
      },
      'metadata/lastUpdated': serverTimestamp()
    });

    return {
      success: true,
      messageId: newMessageRef.key,
      message: 'Message sent successfully'
    };

  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error(`Failed to send message: ${error.message}`);
  }
};

/**
 * Get user's online status
 */
export const getUserOnlineStatus = (userId, callback) => {
  if (!userId) {
    console.warn('User ID is required for getting online status');
    return () => {};
  }

  const statusRef = ref(realtimeDb, `status/${userId}`);
  
  return onValue(statusRef, (snapshot) => {
    const status = snapshot.val() || { state: 'offline', lastChanged: Date.now() };
    callback(status.state === 'online');
  }, (error) => {
    console.error('Error getting user status:', error);
    callback(false);
  });
};

/**
 * Update chat room status
 */
export const updateChatRoomStatus = async (appointmentId, status) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User must be authenticated');

    const updates = {
      status,
      'metadata/lastUpdated': serverTimestamp(),
      'metadata/lastUpdatedBy': currentUser.uid
    };

    const chatRoomRef = ref(realtimeDb, `chats/${appointmentId}`);
    await update(chatRoomRef, updates);

    return {
      success: true,
      message: `Chat room status updated to ${status}`
    };

  } catch (error) {
    console.error('Error updating chat room status:', error);
    throw new Error(`Failed to update chat room status: ${error.message}`);
  }
};

/**
 * Get appointments
 */
export const getAppointments = (callback) => {
  try {
    const appointmentsRef = ref(realtimeDb, 'appointments');
    
    return onValue(appointmentsRef, (snapshot) => {
      const appointments = [];
      
      snapshot.forEach((childSnapshot) => {
        const appointment = {
          id: childSnapshot.key,
          ...childSnapshot.val()
        };

        // Only include relevant appointments (not completed/cancelled)
        if (['pending', 'confirmed', 'in-consultation'].includes(appointment.status)) {
          appointments.push(appointment);
        }
      });

      // Sort appointments by date and time
      appointments.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA - dateB;
        }
        
        // If same date, sort by time
        const timeA = Array.isArray(a.times) ? a.times[0] : a.time;
        const timeB = Array.isArray(b.times) ? b.times[0] : b.time;
        return timeA.localeCompare(timeB);
      });

      callback(appointments);
    }, (error) => {
      console.error('Error getting appointments:', error);
      callback([]);
    });

  } catch (error) {
    console.error('Error setting up appointments listener:', error);
    return () => {}; // Return empty cleanup function
  }
};

/**
 * Get a single appointment
 */
export const getAppointment = async (appointmentId) => {
  try {
    if (!appointmentId) throw new Error('Appointment ID is required');

    const appointmentRef = ref(realtimeDb, `appointments/${appointmentId}`);
    const snapshot = await get(appointmentRef);

    if (!snapshot.exists()) {
      throw new Error('Appointment not found');
    }

    return {
      id: snapshot.key,
      ...snapshot.val()
    };

  } catch (error) {
    console.error('Error getting appointment:', error);
    throw new Error(`Failed to get appointment: ${error.message}`);
  }
};

/**
 * Join chat room
 */
export const joinChatRoom = async (roomId, userId, userRole) => {
  try {
    const roomRef = ref(realtimeDb, `consultation-rooms/${roomId}/participants/${userId}`);
    await set(roomRef, {
      joinedAt: new Date().toISOString(),
      role: userRole
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error joining chat room:', error);
    throw error;
  }
};