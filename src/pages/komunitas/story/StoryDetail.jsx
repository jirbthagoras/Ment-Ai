import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShare2, FiHeart, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { getStoryById, toggleLike, addComment, deleteComment, deleteStory } from '../../../firebase/storyOperations';
import { auth } from '../../../firebase';
import { toast } from 'react-toastify';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase';

const StoryDetail = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchStory();
  }, [storyId]);

  useEffect(() => {
    if (story && auth.currentUser) {
      setIsLiked(story.likedBy?.includes(auth.currentUser.uid) || false);
    }
  }, [story]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('Fetched user profile:', userData);
            setUserProfile(userData);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const fetchStory = async () => {
    try {
      const storyData = await getStoryById(storyId);
      setStory(storyData);
    } catch {
      toast.error('Failed to fetch story');
      navigate('/BagikanCerita');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!auth.currentUser) {
      toast.error('Please log in to like stories');
      return;
    }

    try {
      await toggleLike(storyId);
      // Update local state optimistically
      setIsLiked(!isLiked);
      // Fetch the latest story data
      fetchStory();
    } catch (error) {
      // Revert optimistic update if the operation fails
      setIsLiked(isLiked);
      toast.error('Failed to like story');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: story.title,
          text: story.content.substring(0, 100) + '...',
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch {
      toast.error('Failed to share story');
    }
  };

  const handleDeleteStory = async () => {
    if (!auth.currentUser || auth.currentUser.uid !== story.authorId) {
      toast.error('You are not authorized to delete this story');
      return;
    }

    if (window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      try {
        await deleteStory(storyId);
        toast.success('Story deleted successfully');
        navigate('/BagikanCerita');
      } catch {
        toast.error('Failed to delete story');
      }
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('Please log in to comment');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      // Get user profile data
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;

      if (!userData?.username && !isAnonymousComment) {
        toast.error('Please complete your profile first');
        navigate('/complete-profile');
        return;
      }

      // Create the comment data with persistent user info
      const commentData = {
        id: Date.now().toString(),
        text: comment.trim(),
        authorId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
        isAnonymous: isAnonymousComment,
        // Store complete user data
        authorName: isAnonymousComment ? 'Anonymous' : userData.username,
        authorProfile: isAnonymousComment ? null : {
          uid: auth.currentUser.uid,
          username: userData.username,
          photoURL: userData.photoURL || null,
          displayName: userData.displayName || userData.username,
          email: userData.email
        }
      };

      await addComment(storyId, commentData);
      setComment('');
      setIsAnonymousComment(false);
      toast.success('Comment added successfully');
      fetchStory();
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!auth.currentUser) return;

    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(storyId, commentId);
        toast.success('Comment deleted successfully');
        fetchStory(); // Refresh to update comments
      } catch {
        toast.error('Failed to delete comment');
      }
    }
  };

  const formatDate = (dateString) => {
    let date;
    if (dateString?.toDate) {
      // Handle Firestore Timestamp
      date = dateString.toDate();
    } else if (dateString) {
      // Handle ISO string
      date = new Date(dateString);
    } else {
      return 'Date not available';
    }

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#A0A9FF] via-[#6E7AE2] to-[#1E498E] 
                      flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!story) return null;

  const isAuthor = auth.currentUser?.uid === story.authorId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0A9FF] via-[#6E7AE2] to-[#1E498E]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate('/BagikanCerita')}
          className="flex items-center text-white/80 hover:text-white mb-8 transition-colors mt-12"
        >
          <FiArrowLeft className="mr-2" />
          Kembali
        </button>

        {/* Story Card */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20">
          {/* Story Header with Actions */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                {story.title}
              </h1>
              {/* Action Buttons Container */}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleLike}
                  className="flex items-center space-x-2 hover:text-white transition-colors text-white/70"
                >
                  <FiHeart 
                    className={`w-5 h-5 transition-colors ${
                      isLiked ? 'text-red-500 fill-current' : ''
                    }`}
                  />
                  <span>{story.likes || 0}</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <FiShare2 className="w-5 h-5" />
                </button>
                {isAuthor && (
                  <button
                    onClick={handleDeleteStory}
                    className="text-white/70 hover:text-red-500 transition-colors"
                    title="Delete Story"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            {/* Author Info with Avatar */}
            <div className="flex items-center text-white/70 space-x-4 bg-white/5 px-4 py-2 rounded-lg">
              {/* User Avatar */}
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                {story.isAnonymous ? (
                  <span className="text-xl text-white/70">A</span>
                ) : (
                  story.authorProfile?.photoURL ? (
                    <img 
                      src={story.authorProfile.photoURL || `https://ui-avatars.com/api/?name=${story.authorProfile?.username || 'U'}&background=random`}
                      alt={story.authorProfile?.username || 'User'}
                      className="h-full w-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${story.authorProfile?.username?.charAt(0) || 'U'}&background=random`;
                      }}
                    />
                  ) : (
                    <span className="text-xl text-white/70">
                      {story.authorProfile?.username?.charAt(0) || 'U'}
                    </span>
                  )
                )}
              </div>
              
              {/* Author Name and Date */}
              <div className="flex flex-col">
                <span className="font-medium text-white">
                  {story.isAnonymous 
                    ? 'Anonymous' 
                    : (story.authorProfile?.username || story.authorName || 'User')}
                </span>
                <span className="text-sm text-white/60">{formatDate(story.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Story Content */}
          <div className="prose prose-lg prose-invert max-w-none">
            <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
              {story.content}
            </div>
          </div>

          {/* Social Sharing - Removed duplicate buttons */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex justify-between items-center">
              <div className="text-white/70">
                {story.comments?.length || 0} Comments
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Komentar</h2>
            <div className="bg-white/5 rounded-xl p-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Silahkan Berkomentar"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 
                         text-white placeholder-white/60 focus:outline-none 
                         focus:ring-2 focus:ring-white/30"
                rows="3"
              ></textarea>
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center space-x-2 text-white/70">
                  <input
                    type="checkbox"
                    checked={isAnonymousComment}
                    onChange={(e) => setIsAnonymousComment(e.target.checked)}
                    className="rounded border-white/20 bg-white/10"
                  />
                  <span>Komentari secara anonim</span>
                </label>
                <button 
                  onClick={handleComment}
                  className="px-6 py-2 bg-white/10 text-white rounded-lg 
                           hover:bg-white/20 transition-colors"
                >
                  Kirim
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6 mt-8">
              {story.comments?.map((comment) => (
                <div key={comment.id} className="bg-white/5 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      {/* Comment Author Avatar */}
                      <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                        {comment.isAnonymous ? (
                          <span className="text-lg text-white/70">A</span>
                        ) : (
                          <img 
                            src={comment.authorProfile?.photoURL || `https://ui-avatars.com/api/?name=${comment.authorProfile?.username || 'U'}&background=random`}
                            alt={comment.authorProfile?.username || 'User'}
                            className="h-full w-full rounded-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${comment.authorProfile?.username?.charAt(0) || 'U'}&background=random`;
                            }}
                          />
                        )}
                      </div>
                      
                      {/* Comment Author Info */}
                      <div>
                        <div className="font-medium text-white">
                          {comment.isAnonymous 
                            ? 'Anonymous' 
                            : (comment.authorProfile?.username || comment.authorName || 'User')}
                        </div>
                        <div className="text-sm text-white/60">
                          {formatDate(comment.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    {(auth.currentUser?.uid === comment.authorId || 
                      auth.currentUser?.uid === story.authorId) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-white/60 hover:text-red-400 transition-colors
                                 bg-white/10 p-1.5 rounded-lg hover:bg-white/20"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                  <p className="text-white/80 bg-white/5 p-4 rounded-lg ml-11">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryDetail; 