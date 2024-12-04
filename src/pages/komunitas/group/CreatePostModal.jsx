import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import PropTypes from 'prop-types';
import { FaUserSecret } from 'react-icons/fa';

const CreatePostModal = ({ 
  isOpen = false, 
  onClose = () => {}, 
  onSubmit = () => {} 
}) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'anxiety',
    mood: 'neutral',
    anonymous: false,
    commentsCount: 0,
    likeCount: 0,
    savedBy: [],
    isPublic: true
  });

  const moodOptions = [
    { id: 'happy', emoji: '😊', label: 'Senang' },
    { id: 'sad', emoji: '😢', label: 'Sedih' },
    { id: 'angry', emoji: '😠', label: 'Marah' },
    { id: 'anxious', emoji: '😰', label: 'Cemas' },
    { id: 'neutral', emoji: '😐', label: 'Biasa' },
    { id: 'excited', emoji: '🤗', label: 'Semangat' },
    { id: 'tired', emoji: '😫', label: 'Lelah' },
    { id: 'hopeful', emoji: '🥺', label: 'Berharap' },
  ];

  const maxLength = 500;
  const charCount = formData.content.length;

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        content: '',
        category: 'anxiety',
        mood: 'neutral',
        anonymous: false,
        commentsCount: 0,
        likeCount: 0,
        savedBy: [],
        isPublic: true
      });
    }
  }, [isOpen]);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (user?.uid) {
      fetchUserProfile();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose(); // Close modal after successful submission
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl w-full max-w-2xl shadow-xl transform my-8"
        >
          {/* Modal Header - Fixed */}
          <div className="bg-gradient-to-r from-[#4B7BE5] to-[#1E498E] px-6 py-4 flex justify-between items-center sticky top-0 z-20">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Buat Postingan Baru
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body - Scrollable */}
          <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
            <form id="postForm" onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Mood Selection */}
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">
                  Bagaimana perasaan Anda?
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {moodOptions.map((mood) => (
                    <button
                      type="button"
                      key={mood.id}
                      onClick={() => setFormData({ ...formData, mood: mood.id })}
                      className={`p-2 rounded-lg transition-all duration-300 group
                        ${formData.mood === mood.id
                          ? 'bg-blue-50 ring-2 ring-blue-500 scale-105'
                          : 'hover:bg-gray-50'}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl transition-transform duration-300 
                          ${formData.mood === mood.id ? 'transform scale-110' : 'group-hover:scale-110'}">
                          {mood.emoji}
                        </span>
                        <span className="text-xs text-gray-600 font-medium">
                          {mood.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">
                  Kategori
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['anxiety', 'depression', 'stress', 'trauma'].map((category) => (
                    <button
                      type="button"
                      key={category}
                      onClick={() => setFormData({ ...formData, category })}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                        ${formData.category === category
                          ? 'bg-blue-500 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {category === 'depression' ? 'Depresi' : 
                       category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <label className="block text-gray-700 text-sm font-medium">
                  Judul
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                    transition-all placeholder:text-gray-400"
                  placeholder="Apa yang ingin Anda bagikan?"
                  required
                />
              </div>

              {/* Content Input with Current Mood Display */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-gray-700 text-sm font-medium">
                    Konten
                  </label>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Mood saat ini:</span>
                    <span className="text-lg">
                      {moodOptions.find(m => m.id === formData.mood)?.emoji}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value.slice(0, maxLength) })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                      transition-all h-32 resize-none placeholder:text-gray-400"
                    placeholder="Bagikan pengalaman atau cerita Anda..."
                    required
                  />
                  <div className="absolute bottom-2 right-2 text-sm text-gray-400">
                    {charCount}/{maxLength}
                  </div>
                </div>
              </div>

              {/* Author Preview */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Posting sebagai:</p>
                <div className="flex items-center gap-2 mt-2">
                  {formData.anonymous ? (
                    <FaUserSecret className="w-8 h-8 text-gray-600" />
                  ) : (
                    <img 
                      src={userProfile?.photoURL || `https://ui-avatars.com/api/?name=${userProfile?.displayName || 'U'}&background=random`}
                      alt="Author avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="font-medium">
                    {formData.anonymous 
                      ? 'Anonymous'
                      : (userProfile?.username || userProfile?.displayName || 'User')}
                  </span>
                </div>
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.anonymous}
                  onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-600">
                  Posting sebagai anonim
                </label>
              </div>
            </form>
          </div>

          {/* Modal Footer - Fixed */}
          <div className="bg-gray-50 px-6 py-4 sticky bottom-0 z-20 border-t border-gray-200">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 
                  transition-colors border border-gray-200 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                form="postForm"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#4B7BE5] to-[#1E498E] 
                  text-white hover:opacity-90 transition-all duration-300 
                  hover:shadow-lg transform hover:-translate-y-0.5
                  flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memposting...
                  </span>
                ) : (
                  <>
                    <span>Posting Sekarang</span>
                    <span>{moodOptions.find(m => m.id === formData.mood)?.emoji}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

CreatePostModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default CreatePostModal; 