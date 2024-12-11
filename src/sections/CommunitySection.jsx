import { useNavigate } from 'react-router-dom';
import Komunitas1 from '../assets/komunitas-1.png'
import Komunitas2 from '../assets/komunitas2.png'

const CommunitySection = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#A0A9FF] to-[#1E498E] py-20 relative" id='Komunitas'>
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-[30rem] h-[30rem] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[35rem] h-[35rem] bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold text-white tracking-tight">Komunitas</h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto leading-relaxed">
            Bergabung dengan komunitas yang peduli tentang kesehatan mental
          </p>
          <div className="w-20 h-0.5 bg-white/30 mx-auto"></div>
        </div>

        {/* Cards Container */}
        <div className="flex flex-col sm:flex-row gap-6 lg:gap-12 justify-center items-stretch px-4">
          {/* Teman Dukungan Card */}
          <div className="flex flex-col w-full sm:w-1/2 max-w-xl mx-auto">
            <div className="group bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl 
                          border border-white/20 transform transition-all duration-500 
                          hover:scale-[1.02] hover:bg-white/20 flex-1">
              <div className="relative mb-6 overflow-hidden rounded-xl aspect-[16/9]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 z-10 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                <img
                  src={Komunitas2}
                  alt="Teman Dukungan"
                  className="w-full h-full object-cover transform transition-transform duration-500 
                           group-hover:scale-110"
                />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">Teman Dukungan</h2>
              <p className="text-white/80 leading-relaxed mb-6">
                Pengguna bisa berinteraksi dengan sesama yang memiliki pengalaman atau kondisi serupa, 
                di mana mereka bisa saling berbagi pengalaman atau tips kesehatan mental.
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/komunitasmental')}
              className="mt-4 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl
                       transform transition-all duration-300 hover:bg-blue-200 
                       hover:shadow-lg hover:-translate-y-1 
                       flex items-center justify-center gap-2"
            >
              <span>Cari Teman Dukungan</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          {/* Bagikan Cerita Card */}
          <div className="flex flex-col w-full sm:w-1/2 max-w-xl mx-auto">
            <div className="group bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl 
                          border border-white/20 transform transition-all duration-500 
                          hover:scale-[1.02] hover:bg-white/20 flex-1">
              <div className="relative mb-6 overflow-hidden rounded-xl aspect-[16/9]">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 z-10 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                <img
                  src={Komunitas1}
                  alt="Bagikan Cerita"
                  className="w-full h-full object-cover transform transition-transform duration-500 
                           group-hover:scale-110"
                />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">Bagikan Cerita</h2>
              <p className="text-white/80 leading-relaxed mb-6">
                Pengguna dapat merekam &quot;cerita&quot; mereka dari awal hingga akhir perjalanan mental mereka, 
                yang bersifat pribadi atau bisa di-share secara anonim untuk inspirasi orang lain.
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/komunitasmental')}
              className="mt-4 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl
                       transform transition-all duration-300 hover:bg-blue-50 
                       hover:shadow-lg hover:-translate-y-1
                       flex items-center justify-center gap-2"
            >
              <span>Bagikan Cerita</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
