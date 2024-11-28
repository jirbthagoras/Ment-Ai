import { useState, useEffect } from 'react'
import { FiHeart, FiUser } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../../firebase'
import { createStory, getStories, deleteStory, toggleLike } from '../../../firebase/storyOperations'
import { toast } from 'react-toastify'

const BagikanCerita = () => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check authentication status
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user)
      if (!user) {
        toast.error('Please log in to share stories')
        navigate('/login') // Redirect to login page
      }
    })

    return () => unsubscribe()
  }, [navigate])

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const fetchedStories = await getStories()
      setStories(fetchedStories)
    } catch {
      toast.error('Failed to fetch stories')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please log in to share stories')
      navigate('/login')
      return
    }

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await createStory({
        title,
        content,
        isAnonymous,
      })
      toast.success('Story shared successfully!')
      setTitle('')
      setContent('')
      setIsAnonymous(false)
      fetchStories() // Refresh stories list
    } catch {
      toast.error('Failed to share story')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (storyId, e) => {
    e.stopPropagation() // Prevent navigation when clicking delete
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await deleteStory(storyId)
        toast.success('Story deleted successfully')
        fetchStories() // Refresh stories list
      } catch {
        toast.error('Failed to delete story')
      }
    }
  }

  const handleEdit = (storyId, e) => {
    e.stopPropagation() // Prevent navigation when clicking edit
    navigate(`/edit-story/${storyId}`)
  }

  const handleLike = async (storyId, e) => {
    e.stopPropagation() // Prevent navigation when clicking like
    if (!isAuthenticated) {
      toast.error('Please log in to like stories')
      navigate('/login')
      return
    }

    try {
      await toggleLike(storyId)
      fetchStories() // Refresh stories to update like count
    } catch {
      toast.error('Failed to like story')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0A9FF] via-[#6E7AE2] to-[#1E498E] py-20 px-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[40rem] h-[40rem] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[45rem] h-[45rem] bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Bagikan Ceritamu
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Setiap cerita berharga. Bagikan pengalamanmu untuk menginspirasi dan memberi harapan kepada orang lain.
          </p>
        </div>

        {/* Story Form Section */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20 mb-16 animate-slideInUp">
          <h2 className="text-2xl font-bold text-white mb-6">Tulis Ceritamu</h2>
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/10 backdrop-blur text-white font-medium px-6 py-3.5 rounded-xl
                       border border-white/20 transition-all duration-300 
                       hover:bg-white hover:text-blue-600 hover:shadow-lg 
                       transform hover:-translate-y-1
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Membagikan...' : 'Bagikan Cerita'}
            </button>
          </form>
        </div>

        {/* Stories Section */}
        <div className="animate-slideInUp">
          <h2 className="text-3xl font-bold text-white mb-8">Cerita dari Sobat Mental</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                onClick={() => navigate(`/story/${story.id}`)}
                className="bg-white/10 backdrop-blur-xl p-6 rounded-xl border border-white/20 
                         transform transition-all duration-300 hover:scale-[1.02] hover:bg-white/20
                         cursor-pointer"
              >
                <h3 className="text-xl font-bold text-white mb-2">{story.title}</h3>
                <div className="flex items-center space-x-2 text-white/70 mb-3">
                  <div className="flex items-center">
                    {story.isAnonymous ? <FiUser /> : null}
                    <span className="ml-1">{story.authorName}</span>
                  </div>
                  <span>•</span>
                  <span>{new Date(story.createdAt?.toDate()).toLocaleDateString()}</span>
                </div>
                <p className="text-white/80 mb-4 line-clamp-3">
                  {story.content.substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between text-white/70">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={(e) => handleLike(story.id, e)}
                      className="flex items-center space-x-1 hover:text-white transition-colors"
                    >
                      <FiHeart />
                      <span>{story.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BagikanCerita 