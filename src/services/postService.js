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
    
    // Create the exact structure required by Firestore rules
    const securePostData = {
      title: postData.title,
      content: postData.content,
      authorId: userId,
      authorName: postData.anonymous ? 'Anonymous' : postData.authorName,
      authorAvatar: postData.anonymous ? '/anonymous-avatar.png' : postData.authorAvatar,
      category: postData.category,
      mood: postData.mood,
      createdAt: serverTimestamp(),
      commentsCount: 0,
      likeCount: 0,
      savedBy: [],
      anonymous: postData.anonymous,
      isPublic: true
    };

    const docRef = await addDoc(postsRef, securePostData);
    
    return {
      id: docRef.id,
      ...securePostData,
      createdAt: new Date(),
      timeAgo: 'just now'
    };
  } catch (error) {
    console.error('Error in createPost:', error);
    throw new Error('Failed to create post: ' + error.message);
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
    
    // Get all comments with their author data
    const commentsWithAuthor = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data();
      
      // If the comment is anonymous, return as is
      if (data.anonymous) {
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          authorName: 'Anonymous',
          authorAvatar: '/anonymous-avatar.png'
        };
      }

      // Get author data for non-anonymous comments
      try {
        const userDoc = await getDoc(doc(db, 'users', data.authorId));
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          authorName: userData?.displayName || data.authorName || 'User',
          authorAvatar: userData?.photoURL || data.authorAvatar || '/anonymous-avatar.png'
        };
      } catch (error) {
        console.error('Error fetching comment author:', error);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          authorName: data.authorName || 'User',
          authorAvatar: data.authorAvatar || '/anonymous-avatar.png'
        };
      }
    }));

    return commentsWithAuthor;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const addComment = async (postId, commentData) => {
  try {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const commentRef = await addDoc(commentsRef, {
      ...commentData,
      createdAt: serverTimestamp()
    });

    // Update post's comment count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentsCount: increment(1)
    });

    return {
      id: commentRef.id,
      ...commentData
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getValidImageUrl = (url, isAnonymous) => {
  if (isAnonymous) return null; // Return null for anonymous posts
  if (!url) return null;
  return url.startsWith('http') ? url : null;
}; 