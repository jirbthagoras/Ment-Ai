import { auth, db, realtimeDb } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { getDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, set, orderByChild, equalTo, onValue, query as dbQuery } from 'firebase/database';

export const fetchUserProfile = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently logged in.");
    }

    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!userDoc.exists()) {
      const defaultUserData = {
        email: currentUser.email,
        displayName: currentUser.displayName || '',
        username: currentUser.displayName || '',
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', currentUser.uid), defaultUserData);
      return defaultUserData;
    }

    const userData = userDoc.data();
    return {
      ...userData,
      email: currentUser.email || userData.email,
      displayName: currentUser.displayName || userData.displayName,
      username: userData.username || currentUser.displayName,
    };

  } catch (err) {
    console.error('Error fetching user data:', err);
    throw err;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No user logged in');

    // Update Firebase Auth profile
    await updateProfile(currentUser, {
      displayName: userData.displayName
    });

    // Update Firestore document
    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date().toISOString()
    });

  } catch (err) {
    console.error('Error updating profile:', err);
    throw err;
  }
};

export const processConsultationData = (consultations) => {
  const now = new Date();
  
  // Filter and sort upcoming consultations
  const upcoming = consultations
    .filter(consultation => {
      const consultDate = new Date(consultation.date);
      return consultation.status === 'pending' && consultDate >= now;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Get recent activity
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

export const setupConsultationListener = (callbacks) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

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
        
        if (appointment.date && appointment.times && appointment.doctor) {
          appointments.push({
            ...appointment,
            time: appointment.times[0],
            status: appointment.status || 'pending',
            roomStatus: appointment.roomStatus,
            hasRoom: appointment.hasRoom || false
          });
          
          appointment.times.forEach(time => {
            slots[`${appointment.date}_${time}`] = true;
          });
        }
      });

      const processedData = processConsultationData(appointments);
      
      callbacks.onConsultationHistory(appointments);
      callbacks.onUpcomingConsultations(processedData.upcoming);
      callbacks.onRecentActivity(processedData.recent);
      callbacks.onStats(processedData.stats);
    });

  } catch (err) {
    console.error('Error setting up consultation listener:', err);
    throw err;
  }
};

export const handleAttendConsultation = async (consultation) => {
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

    return consultation.id;

  } catch (err) {
    console.error('Error joining consultation:', err);
    throw err;
  }
};