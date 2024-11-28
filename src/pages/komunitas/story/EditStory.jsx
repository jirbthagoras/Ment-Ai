import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStoryById, updateStory } from '../../../firebase/storyOperations';
import { toast } from 'react-toastify';

const EditStory = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStory();
  }, [storyId]);

  const fetchStory = async () => {
    try {
      const story = await getStoryById(storyId);
      setTitle(story.title);
      setContent(story.content);
      setIsAnonymous(story.isAnonymous);
    } catch (error) {
      toast.error('Failed to fetch story');
      navigate('/BagikanCerita');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await updateStory(storyId, {
        title,
        content,
        isAnonymous,
      });
      toast.success('Story updated successfully!');
      navigate('/BagikanCerita');
    } catch (error) {
      toast.error('Failed to update story');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0A9FF] via-[#6E7AE2] to-[#1E498E] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Edit Cerita</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul Cerita"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <div>
            <textarea
              rows="6"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bagikan ceritamu di sini..."
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            ></textarea>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="anonymous" className="text-white/90">Bagikan secara anonim</label>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-white/10 backdrop-blur text-white font-medium px-6 py-3.5 rounded-xl
                       border border-white/20 transition-all duration-300 
                       hover:bg-white hover:text-blue-600 hover:shadow-lg 
                       transform hover:-translate-y-1
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/BagikanCerita')}
              className="flex-1 bg-white/10 backdrop-blur text-white font-medium px-6 py-3.5 rounded-xl
                       border border-white/20 transition-all duration-300 
                       hover:bg-red-500 hover:border-red-500 hover:shadow-lg 
                       transform hover:-translate-y-1"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStory; 