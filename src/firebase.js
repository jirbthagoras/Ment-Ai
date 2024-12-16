
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getDoc, doc } from 'firebase/firestore';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCJ1L6mZQrBO3G4_Q8f3p_fHR7geA_aViQ",
  authDomain: "menai-e7169.firebaseapp.com",
  projectId: "menai-e7169",
  storageBucket: "menai-e7169.firebasestorage.app",
  messagingSenderId: "97767797559",
  appId: "1:97767797559:web:586109dab31caf8703a0b2",
  measurementId: "G-7RL736E815"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Realtime Database
const realtimeDb = getDatabase(app);

// Posts collection reference
const postsCollection = collection(db, 'posts');

// Helper function to check admin status
const checkIsAdmin = async (uid) => {
  try {
    if (!uid) return false;
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data()?.isAdmin === true : false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Add a new helper function to check post ownership
const checkPostOwnership = async (postId, userId) => {
  try {
    if (!postId || !userId) return false;
    const postDoc = await getDoc(doc(db, 'posts', postId));
    return postDoc.exists() ? postDoc.data().authorId === userId : false;
  } catch (error) {
    console.error('Error checking post ownership:', error);
    return false;
  }
};

// Helper functions for posts
export const createPost = async (postData) => {
  try {
    const docRef = await addDoc(postsCollection, {
      ...postData,
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
    });
    return { id: docRef.id, ...postData };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const getPosts = async (category = 'all', sortType = 'newest') => {
  try {
    let q = collection(db, 'posts');

    // Apply category filter if not 'all'
    if (category !== 'all') {
      q = query(q, where('category', '==', category));
    }

    // Apply sorting
    switch (sortType) {
      case 'popular':
        q = query(q, orderBy('likes', 'desc'));
        break;
      case 'trending':
        q = query(q, orderBy('comments', 'desc'));
        break;
      default: // 'newest'
        q = query(q, orderBy('timestamp', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    await deleteDoc(doc(db, 'posts', postId));
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

export const updatePostLikes = async (postId, increment) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: increment ? increment : 0
    });
    return true;
  } catch (error) {
    console.error('Error updating post likes:', error);
    throw error;
  }
};

export const updatePostComments = async (postId, increment) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: increment ? increment : 0
    });
    return true;
  } catch (error) {
    console.error('Error updating post comments:', error);
    throw error;
  }
};

// Add these new helper functions for stories
export const getStories = async (userId = null) => {
  try {
    let q = collection(db, 'stories');

    if (userId) {
      q = query(q, where('authorId', '==', userId), orderBy('createdAt', 'desc'));
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }
};

export const getStoryById = async (storyId) => {
  if (!storyId) {
    throw new Error('Story ID is required');
  }

  try {
    const storyRef = doc(db, 'stories', storyId);
    const storySnap = await getDoc(storyRef);

    if (storySnap.exists()) {
      return {
        id: storySnap.id,
        ...storySnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching story:', error);
    throw error;
  }
};

// Export the app, auth, and db instances for use in other files
export { app, auth, db, realtimeDb, checkIsAdmin, checkPostOwnership };
