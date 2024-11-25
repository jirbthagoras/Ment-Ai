// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import Firebase Authentication
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getDatabase } from "firebase/database"; // Add this import

// Your web app's Firebase configuration


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Realtime Database
const realtimeDb = getDatabase(app);

// Helper function to check admin status
const checkIsAdmin = async (uid) => {
  try {
    const { getDoc, doc } = await import('firebase/firestore');
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data()?.isAdmin === true : false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Export the app, auth, and db instances for use in other files
export { app, auth, db, realtimeDb, checkIsAdmin };