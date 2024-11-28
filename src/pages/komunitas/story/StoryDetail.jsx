import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShare2, FiHeart, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { getStoryById, toggleLike, addComment, deleteComment, deleteStory } from '../../../firebase/storyOperations';
import { auth } from '../../../firebase';
import { toast } from 'react-toastify';

const StoryDetail = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchStory();
  }, [storyId]);

  useEffect(() => {
    if (story && auth.currentUser) {
      setIsLiked(story.likedBy?.includes(auth.currentUser.uid) || false);
    }
  }, [story]);

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
      await addComment(storyId, {
        text: comment,
        isAnonymous: isAnonymousComment
      });
      setComment('');
      setIsAnonymousComment(false);
      toast.success('Comment added successfully');
      fetchStory(); // Refresh to show new comment
    } catch {
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
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
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
            {/* Author Info */}
            <div className="flex items-center text-white/70 space-x-4">
              <span>{story.authorName}</span>
              <span>•</span>
              <span>{new Date(story.createdAt?.toDate()).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</span>
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
                <div key={comment.id} className="bg-white/5 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-medium text-white">
                        {comment.isAnonymous ? 'Anonymous' : comment.authorName}
                      </div>
                      <div className="text-sm text-white/60">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                    {(auth.currentUser?.uid === comment.authorId || 
                      auth.currentUser?.uid === story.authorId) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-white/60 hover:text-red-400 transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                  <p className="text-white/80">{comment.text}</p>
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