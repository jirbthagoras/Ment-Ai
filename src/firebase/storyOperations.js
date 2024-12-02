import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const storiesCollection = collection(db, 'stories');

export const createStory = async (storyData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('You must be logged in to create a story');

    const newStory = {
      ...storyData,
      authorId: user.uid,
      authorName: storyData.isAnonymous ? 'Anonymous' : (user.displayName || 'Unknown User'),
      authorEmail: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0,
      bookmarks: 0,
    };

    if (!newStory.title || !newStory.content) {
      throw new Error('Title and content are required');
    }

    const docRef = await addDoc(storiesCollection, newStory);
    return { id: docRef.id, ...newStory };
  } catch (error) {
    console.error('Error creating story:', error);
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to create stories. Please log in.');
    }
    throw error;
  }
};

export const updateStory = async (storyId, updateData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User must be logged in to update a story');

    const storyRef = doc(db, 'stories', storyId);
    const storySnap = await getDoc(storyRef);

    if (!storySnap.exists()) throw new Error('Story not found');
    if (storySnap.data().authorId !== user.uid) throw new Error('Unauthorized to edit this story');

    await updateDoc(storyRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    return { id: storyId, ...updateData };
  } catch (error) {
    console.error('Error updating story:', error);
    throw error;
  }
};

export const deleteStory = async (storyId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to delete stories');

    const storyRef = doc(db, 'stories', storyId);
    const storyDoc = await getDoc(storyRef);
    
    if (!storyDoc.exists()) {
      throw new Error('Story not found');
    }

    const story = storyDoc.data();
    if (story.authorId !== user.uid) {
      throw new Error('Not authorized to delete this story');
    }

    await deleteDoc(storyRef);
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
};

export const getStories = async (filter = 'all') => {
  try {
    let q = storiesCollection;
    const user = auth.currentUser;

    switch (filter) {
      case 'my':
        if (!user) throw new Error('User must be logged in to view their stories');
        q = query(storiesCollection, where('authorId', '==', user.uid));
        break;
      case 'popular':
        q = query(storiesCollection, orderBy('likes', 'desc'));
        break;
      default:
        q = query(storiesCollection, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }
};

export const getStoryById = async (storyId) => {
  try {
    const storyRef = doc(db, 'stories', storyId);
    const storySnap = await getDoc(storyRef);

    if (!storySnap.exists()) throw new Error('Story not found');

    return {
      id: storySnap.id,
      ...storySnap.data(),
    };
  } catch (error) {
    console.error('Error fetching story:', error);
    throw error;
  }
};

export const toggleLike = async (storyId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to like stories');

    const storyRef = doc(db, 'stories', storyId);
    const storyDoc = await getDoc(storyRef);
    
    if (!storyDoc.exists()) {
      throw new Error('Story not found');
    }

    const story = storyDoc.data();
    const likedBy = story.likedBy || [];
    const isLiked = likedBy.includes(user.uid);

    await updateDoc(storyRef, {
      likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      likes: increment(isLiked ? 1 : -1)
    });

    return !isLiked;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

export const addComment = async (storyId, commentData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to comment');

    const storyRef = doc(db, 'stories', storyId);
    const newComment = {
      id: crypto.randomUUID(), // Generate unique ID for the comment
      text: commentData.text,
      authorId: user.uid,
      authorName: commentData.isAnonymous ? 'Anonymous' : (user.displayName || 'Unknown User'),
      isAnonymous: commentData.isAnonymous,
      createdAt: new Date().toISOString() // Use ISO string instead of serverTimestamp
    };

    await updateDoc(storyRef, {
      comments: arrayUnion(newComment)
    });

    return newComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const deleteComment = async (storyId, commentId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to delete comments');

    const storyRef = doc(db, 'stories', storyId);
    const storyDoc = await getDoc(storyRef);
    const story = storyDoc.data();

    const comment = story.comments.find(c => c.id === commentId);
    if (!comment) throw new Error('Comment not found');

    // Only allow comment author or story author to delete
    if (comment.authorId !== user.uid && story.authorId !== user.uid) {
      throw new Error('Not authorized to delete this comment');
    }

    await updateDoc(storyRef, {
      comments: arrayRemove(comment)
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}; 