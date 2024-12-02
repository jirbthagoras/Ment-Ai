import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CreatePostModal from './CreatePostModal';
import { getPosts, toggleLike, toggleSave, deletePost, createPost } from '../../../services/postService';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../../../firebase';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const getValidImageUrl = (url) => {
  if (!url) return '/anonymous-avatar.png';
  return url.startsWith('http') ? url : '/anonymous-avatar.png';
};

const moodEmojis = {
  'happy': '😊',
  'sad': '😢',
  'angry': '😠',
  'anxious': '😰',
  'neutral': '😐',
  'excited': '🤗',
  'tired': '😫',
  'hopeful': '🥺'
};

const TemanDukungan = () => {
  const auth = useAuth();
  const user = auth?.user;
  const [userProfile, setUserProfile] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);

  const [postComments, setPostComments] = useState({});

  const categories = [
    { id: 'all', label: 'Semua', icon: '🌟' },
    { id: 'anxiety', label: 'Anxiety', icon: '😰' },
    { id: 'depression', label: 'Depresi', icon: '😢' },
    { id: 'stress', label: 'Stress', icon: '😫' },
    { id: 'trauma', label: 'Trauma', icon: '😔' },
    { id: 'moodswing', label: 'MoodSwing', icon: '🎭' },
  ];

  const navigate = useNavigate();

  // Wrap fetchUserProfile in useCallback
  const fetchUserProfile = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [user?.uid]);

  // Update useEffect with fetchUserProfile dependency
  useEffect(() => {
    if (user?.uid) {
      fetchUserProfile();
    }
  }, [user?.uid, fetchUserProfile]);

  const handleCreatePost = async (postData) => {
    if (!user?.uid) {
      console.error('User not authenticated');
      return;
    }

    try {
      const newPostData = {
        title: postData.title.trim(),
        content: postData.content.trim(),
        authorId: user.uid,
        authorName: postData.anonymous ? 'Anonymous' : (userProfile?.displayName || 'User'),
        authorAvatar: postData.anonymous ? '/anonymous-avatar.png' : getValidImageUrl(userProfile?.photoURL),
        category: postData.category,
        mood: postData.mood,
        createdAt: new Date(),
        commentsCount: 0,
        likeCount: 0,
        savedBy: [],
        anonymous: postData.anonymous,
        isPublic: true,
      };

      // Add validation
      if (newPostData.content.length > 2000) {
        throw new Error('Content must be less than 2000 characters');
      }
      if (newPostData.title.length > 100) {
        throw new Error('Title must be less than 100 characters');
      }

      const createdPost = await createPost(newPostData, user.uid);
      
      // Update posts state properly
      setPosts(prevPosts => {
        // Check if post already exists
        const existingPostIndex = prevPosts.findIndex(p => p.id === createdPost.id);
        if (existingPostIndex !== -1) {
          // Update existing post
          const updatedPosts = [...prevPosts];
          updatedPosts[existingPostIndex] = createdPost;
          return updatedPosts;
        }
        // Add new post at the beginning
        return [createdPost, ...prevPosts];
      });
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert(error.message || 'Failed to create post. Please try again.');
    }
  };

  // Update fetchPosts to not use removed states
  const fetchPosts = async (category = 'all', sortBy = 'newest') => {
    try {
      const fetchedPosts = await getPosts(category, sortBy);
      setPosts(fetchedPosts.map(post => ({
        ...post,
        id: post.id,
        likes: post.likeCount || 0,
        comments: post.commentsCount || 0
      })));
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts(selectedCategory, sortBy);
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    const unsubscribers = posts.map(post => {
      const commentsRef = collection(db, 'posts', post.id, 'comments');
      return onSnapshot(commentsRef, (snapshot) => {
        setPostComments(prev => ({
          ...prev,
          [post.id]: snapshot.size
        }));
      });
    });

    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
  }, [posts]);

  const handleLike = async (postId) => {
    if (!user?.uid) {
      return;
    }
    try {
      const isLiked = await toggleLike(postId, user.uid);
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likeCount: isLiked ? (post.likeCount || 0) + 1 : (post.likeCount || 0) - 1,
            isLiked
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSave = async (postId) => {
    if (!user?.uid) {
      return;
    }
    try {
      const isSaved = await toggleSave(postId, user.uid);
      setPosts(posts.map(post => {
        if (post.id === postId) {
          const savedBy = post.savedBy || [];
          return {
            ...post,
            savedBy: isSaved 
              ? [...savedBy, user.uid]
              : savedBy.filter(id => id !== user.uid),
            isSaved
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const getFilteredPosts = () => {
    let filtered = [...posts];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    switch (sortBy) {
      case 'newest':
        return filtered;
      case 'popular':
        return filtered.sort((a, b) => b.likes - a.likes);
      case 'discussed':
        return filtered.sort((a, b) => b.comments - a.comments);
      default:
        return filtered;
    }
  };
  

  // Update timeAgo periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPosts(currentPosts => 
        currentPosts.map(post => ({
          ...post,
          timeAgo: formatDistanceToNow(post.createdAt, { addSuffix: true })
            .replace('about ', '')
            .replace('in ', 'dalam ')
            .replace('ago', 'yang lalu')
        }))
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleDeletePost = async (postId) => {
    if (!user) return;
    
    if (window.confirm('Apakah Anda yakin ingin menghapus postingan ini?')) {
      try {
        await deletePost(postId);
        setPosts(posts.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  // Render post
  const renderPost = (post) => (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 
        shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Author Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Profile Image Container */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-lg"
          >
            {post.authorAvatar ? (
              <img 
                src={getValidImageUrl(post.authorAvatar)}
                alt={post.authorName || 'Anonymous'}
                className="h-full w-full rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  // Fallback to initial display
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : (
              <span className="text-2xl text-blue-600">
                {(post.anonymous ? 'A' : post.authorName?.charAt(0)) || '?'}
              </span>
            )}
            
            {/* Status Indicator - Only show for non-anonymous posts */}
            {!post.anonymous && (
              <div 
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 
                  bg-green-400 rounded-full 
                  border-2 border-[#4B7BE5]
                  shadow-sm"
              />
            )}
          </motion.div>
          
          {/* Author Name and Time */}
          <div className="flex flex-col">
            <h3 className="text-white font-medium text-sm">
              {post.anonymous ? 'Anonymous' : (post.authorName || 'User')}
            </h3>
            <p className="text-white/60 text-xs">
              {post.timeAgo || 'less than a minute ago'}
            </p>
          </div>
        </div>
        
        {(user?.uid === post.authorId) && (
          <div className="relative group">
            <button 
              className="text-white/60 hover:text-white p-2 rounded-full
                hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" 
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white/10 backdrop-blur-md 
              border border-white/20 shadow-lg opacity-0 invisible group-hover:opacity-100 
              group-hover:visible transition-all duration-200 z-50">
              <button
                onClick={() => handleDeletePost(post.id)}
                className="w-full px-4 py-2 text-left text-white hover:bg-white/10 
                  transition-colors rounded-xl flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" 
                  viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus Postingan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">{post.title}</h2>
        <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        
        {/* Mood and Category Tags */}
        <div className="flex flex-wrap gap-2">
          {post.mood && (
            <span className="px-4 py-1.5 rounded-full bg-white/25 text-white text-sm 
              font-medium flex items-center gap-2">
              <span role="img" aria-label="mood">
                {moodEmojis[post.mood.toLowerCase()] || '😐'}
              </span>
              {post.mood}
            </span>
          )}
          {post.category && (
            <span className="px-4 py-1.5 rounded-full bg-white/25 text-white text-sm font-medium">
              {categories.find(c => c.id === post.category)?.label}
            </span>
          )}
        </div>
      </div>

      {/* Interaction Buttons */}
      <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/10">
        <button
          onClick={() => handleLike(post.id)}
          className={`flex items-center gap-2 text-white/80 hover:text-white 
            transition-all hover:scale-105 active:scale-95 ${post.isLiked ? 'text-pink-400' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" 
            className={`h-6 w-6 ${post.isLiked ? 'fill-current' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{post.likes || 0}</span>
        </button>

        <button
          onClick={() => handleSave(post.id)}
          className={`flex items-center gap-2 text-white/80 hover:text-white 
            transition-all hover:scale-105 active:scale-95 ${post.isSaved ? 'text-yellow-400' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" 
            className={`h-6 w-6 ${post.isSaved ? 'fill-current' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span>Simpan</span>
        </button>

        <button 
          onClick={() => navigate(`/komunitas/post/${post.id}`)}
          className="flex items-center gap-2 text-white/80 hover:text-white 
            transition-all hover:scale-105 active:scale-95 ml-auto relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{postComments[post.id] || 0}</span>
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FF8FB8] via-[#4B7BE5] to-[#1E498E]">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Teman Dukungan</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Berbagi pengalaman dan dukungan dengan mereka yang memahami perjalananmu
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Cari postingan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-xl bg-white/10 backdrop-blur-sm
                border border-white/20 text-white placeholder:text-white/60
                focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Sort and Create Post */}
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-xl
                border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="newest">Terbaru</option>
              <option value="popular">Terpopuler</option>
              <option value="discussed">Paling Dibahas</option>
            </select>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-xl
                border border-white/20 transition-all duration-300 flex items-center gap-2
                hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Buat Postingan Baru
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full transition-all duration-300 whitespace-nowrap
                flex items-center gap-2
                ${selectedCategory === category.id 
                  ? 'bg-white text-blue-600 shadow-lg' 
                  : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className="grid gap-6">
          <AnimatePresence>
            {getFilteredPosts().map(renderPost)}
          </AnimatePresence>
        </div>
      </div>

      <CreatePostModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default TemanDukungan; 