import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  updateDoc,
  doc,
  increment,
  deleteDoc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { formatDistanceToNow } from 'date-fns';

// Create a new post
export const createPost = async (postData, userId) => {
  try {
    const postsRef = collection(db, 'posts');
    
    // Add security rules
    const securePostData = {
      ...postData,
      authorId: userId,
      createdAt: serverTimestamp(),
      isPublic: true,
      anonymous: postData.anonymous || false,
      authorName: postData.anonymous ? 'Anonymous' : postData.authorName,
      authorAvatar: postData.anonymous ? null : postData.authorAvatar,
      // Add default values
      likeCount: 0,
      commentsCount: 0,
      savedBy: [],
      // Ensure these fields exist
      title: postData.title || '',
      content: postData.content || '',
      category: postData.category || 'general',
      mood: postData.mood || 'neutral'
    };

    const docRef = await addDoc(postsRef, securePostData);
    
    // Return the created post with its ID
    return {
      id: docRef.id,
      ...securePostData,
      createdAt: new Date(), // Convert serverTimestamp to Date for immediate use
      timeAgo: 'just now'
    };
  } catch (error) {
    console.error('Error in createPost:', error);
    throw new Error('Failed to create post. Please try again.');
  }
};

// Get posts with filters
export const getPosts = async (category = 'all', sortBy = 'newest') => {
  try {
    let q = collection(db, 'posts');

    // Apply category filter
    if (category !== 'all') {
      q = query(q, where('category', '==', category));
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        q = query(q, orderBy('likes', 'desc'), orderBy('createdAt', 'desc'));
        break;
      case 'discussed':
        q = query(q, orderBy('comments', 'desc'), orderBy('createdAt', 'desc'));
        break;
      default: // newest
        q = query(q, orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate() || new Date();
      
      return {
        id: doc.id,
        ...data,
        createdAt,
        timeAgo: formatDistanceToNow(createdAt, { addSuffix: true })
          .replace('about ', '')
          .replace('in ', 'dalam ')
          .replace('ago', 'yang lalu')
      };
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

// Toggle like on a post
export const toggleLike = async (postId, userId) => {
  if (!postId || !userId) {
    console.error('Missing postId or userId');
    return false;
  }

  try {
    const postRef = doc(db, 'posts', postId);
    const likesRef = doc(db, 'posts', postId, 'likes', userId);
    
    const batch = writeBatch(db);
    const likeDoc = await getDoc(likesRef);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    if (likeDoc.exists()) {
      // Unlike
      batch.delete(likesRef);
      batch.update(postRef, {
        likeCount: increment(-1)
      });
    } else {
      // Like
      batch.set(likesRef, {
        userId,
        createdAt: serverTimestamp()
      });
      batch.update(postRef, {
        likeCount: increment(1)
      });
    }
    
    await batch.commit();
    return !likeDoc.exists();
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Toggle save on a post
export const toggleSave = async (postId, userId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDocs(postRef);
    const postData = postDoc.data();
    
    const isSaved = postData.savedBy.includes(userId);
    
    await updateDoc(postRef, {
      savedBy: isSaved 
        ? postData.savedBy.filter(id => id !== userId)
        : [...postData.savedBy, userId]
    });

    return !isSaved;
  } catch (error) {
    console.error('Error toggling save:', error);
    throw error;
  }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    
    // Also delete all comments for this post
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const commentsSnapshot = await getDocs(commentsRef);
    
    const batch = writeBatch(db);
    commentsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

export const getPost = async (postId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }

    const data = postDoc.data();
    return {
      id: postDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date()
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};

export const getComments = async (postId) => {
  try {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      };
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const addComment = async (postId, comment) => {
  try {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const docRef = await addDoc(commentsRef, {
      ...comment,
      authorAvatar: comment.authorAvatar || '/anonymous-avatar.png',
      createdAt: serverTimestamp()
    });

    // Update post comments count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentsCount: increment(1)
    });

    return {
      id: docRef.id,
      ...comment,
      createdAt: new Date() // Use current date for immediate display
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}; 