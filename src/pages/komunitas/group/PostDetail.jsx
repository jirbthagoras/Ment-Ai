import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { getPost, addComment, getComments, toggleLike } from '../../../services/postService';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale'; // Import Indonesian locale
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase';

const formatDate = (timestamp) => {
  if (!timestamp) return 'Baru saja';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { 
      addSuffix: true,
      locale: id // Use Indonesian locale
    });
  } catch (error) {
    return 'Baru saja';
  }
};

const getValidImageUrl = (url) => {
  if (!url) return '/anonymous-avatar.png';
  return url.startsWith('http') ? url : '/anonymous-avatar.png';
};

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const postData = await getPost(postId);
        setPost(postData);
        
        const commentsData = await getComments(postId);
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching post details:', error);
        setError('Gagal memuat post. Silakan coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchPostAndComments();
    }
  }, [postId]);

  const handleLike = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const isLiked = await toggleLike(postId, user.uid);
      setPost(prev => ({
        ...prev,
        isLiked,
        likeCount: isLiked ? (prev.likeCount || 0) + 1 : (prev.likeCount || 0) - 1
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) {
      if (!user) setShowLoginPrompt(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userProfile = userDoc.exists() ? userDoc.data() : null;

      const comment = {
        content: newComment.trim(),
        authorId: user.uid,
        authorName: userProfile?.username || userProfile?.displayName || 'User',
        authorAvatar: userProfile?.photoURL || `https://ui-avatars.com/api/?name=${userProfile?.displayName || 'U'}&background=random`,
        createdAt: new Date(),
        anonymous: false,
        isPublic: true
      };

      const addedComment = await addComment(postId, comment);
      
      setComments(prevComments => [{
        ...addedComment,
        authorName: comment.authorName,
        authorAvatar: comment.authorAvatar
      }, ...prevComments]);
      
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/anonymous-avatar.png';
    e.target.onerror = null; // Prevents infinite loop
  };

  // Loading and Error states with better UI
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FF8FB8] via-[#4B7BE5] to-[#1E498E] 
        flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/20 backdrop-blur-md rounded-2xl p-8 text-white text-center max-w-md w-full"
        >
          <svg className="w-16 h-16 mx-auto mb-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <h3 className="text-xl font-semibold mb-2">Terjadi Kesalahan</h3>
          <p className="mb-6 text-white/80">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all
              hover:scale-105 active:scale-95 duration-200"
          >
            Kembali
          </button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FF8FB8] via-[#4B7BE5] to-[#1E498E] 
        flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Memuat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FF8FB8] via-[#4B7BE5] to-[#1E498E]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mt-20 mb-6 text-white/80 hover:text-white flex items-center gap-2 
            transition-all hover:gap-3 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 transition-transform group-hover:-translate-x-1" 
            viewBox="0 0 20 20" fill="currentColor"
          >
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" />
          </svg>
          Kembali
        </motion.button>

        {/* Post Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 
            shadow-lg hover:shadow-xl transition-all duration-300 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-lg"
              >
                {post?.authorAvatar ? (
                  <img 
                    src={getValidImageUrl(post.authorAvatar)}
                    alt={post.authorName || 'Anonymous'}
                    className="h-full w-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <span className="text-2xl text-blue-600">
                    {(post?.anonymous ? 'A' : post?.authorName?.charAt(0)) || '?'}
                  </span>
                )}
                
                {!post?.anonymous && (
                  <div 
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 
                      bg-green-400 rounded-full 
                      border-2 border-[#4B7BE5]
                      shadow-sm"
                  />
                )}
              </motion.div>
              
              <div className="flex flex-col">
                <h3 className="text-white font-medium text-sm">
                  {post?.anonymous ? 'Anonymous' : (post?.authorName || 'User')}
                </h3>
                <p className="text-white/60 text-xs">
                  {formatDate(post?.createdAt)}
                </p>
              </div>
            </div>
            
            <button className="text-white/60 hover:text-white p-2 rounded-full
              hover:bg-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" 
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>

          <h1 className="text-2xl font-bold text-white mb-4">{post?.title}</h1>
          <p className="text-white/90 leading-relaxed mb-6 whitespace-pre-wrap">
            {post?.content}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {post?.mood && (
              <span className="px-4 py-1.5 rounded-full bg-white/25 text-white text-sm 
                font-medium flex items-center gap-2">
                <span role="img" aria-label="mood">
                  {post.mood === 'Happy' ? '😊' : 
                   post.mood === 'Sad' ? '😢' : 
                   post.mood === 'Angry' ? '😠' : '😐'}
                </span>
                {post.mood}
              </span>
            )}
            {post?.category && (
              <span className="px-4 py-1.5 rounded-full bg-white/25 text-white text-sm font-medium">
                {post.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 pt-6 border-t border-white/10">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 text-white/80 hover:text-white 
                transition-all hover:scale-105 active:scale-95 ${post?.isLiked ? 'text-pink-400' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" 
                className={`h-6 w-6 ${post?.isLiked ? 'fill-current' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post?.likeCount || 0}</span>
            </button>

            <div className="flex items-center gap-2 text-white/80">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" 
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{comments.length}</span>
            </div>
          </div>
        </motion.div>

        {/* Comment Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitComment}
          className="mb-8"
        >
          <div className="flex gap-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shadow-lg flex-shrink-0"
            >
              {user ? (
                user.photoURL ? (
                  <img 
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-full w-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.textContent = user.displayName?.charAt(0) || '?';
                      e.target.className = "text-xl text-white/80";
                    }}
                  />
                ) : (
                  <span className="text-xl text-white/80">
                    {user.displayName?.charAt(0) || '?'}
                  </span>
                )
              ) : (
                <span className="text-xl text-white/80">?</span>
              )}
              
              <div 
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 
                  bg-green-400 rounded-full 
                  border-2 border-[#4B7BE5]"
              />
            </motion.div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? "Tulis komentar..." : "Login untuk menulis komentar..."}
                disabled={!user || isSubmitting}
                className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm
                  border border-white/20 text-white placeholder:text-white/60
                  focus:outline-none focus:ring-2 focus:ring-white/30 resize-none
                  disabled:opacity-50 disabled:cursor-not-allowed"
                rows="3"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || !user || isSubmitting}
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl
                    transition-all hover:scale-105 active:scale-95 duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    flex items-center gap-2"
                >
                  {isSubmitting && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" 
                        stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  Kirim Komentar
                </button>
              </div>
            </div>
          </div>
        </motion.form>

        {/* Comments List */}
        <div className="space-y-6">
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/20 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shadow-lg flex-shrink-0"
                  >
                    {comment.authorAvatar ? (
                      <img
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        className="h-full w-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/anonymous-avatar.png';
                        }}
                      />
                    ) : (
                      <img
                        src="/anonymous-avatar.png"
                        alt="Anonymous"
                        className="h-full w-full rounded-full object-cover"
                      />
                    )}
                    
                    <div 
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 
                        bg-green-400 rounded-full 
                        border-2 border-[#4B7BE5]"
                    />
                  </motion.div>
                  <div className="flex-grow">
                    <h4 className="text-white font-medium">{comment.authorName}</h4>
                    <p className="text-white/60 text-sm">{formatDate(comment.createdAt)}</p>
                    <p className="text-white/90 mt-2 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center 
              justify-center p-4 z-50"
            onClick={() => setShowLoginPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/20 backdrop-blur-md rounded-2xl p-6 max-w-sm w-full
                text-white text-center"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Login Diperlukan</h3>
              <p className="mb-6">Silakan login terlebih dahulu untuk melakukan interaksi.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-xl
                    transition-all hover:scale-105 active:scale-95"
                >
                  Nanti Saja
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-xl
                    transition-all hover:scale-105 active:scale-95"
                >
                  Login
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostDetail; 