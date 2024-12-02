import Komunitas1 from '../../assets/komunitas-1.png'
import Komunitas2 from '../../assets/komunitas2.png'
import { useNavigate } from 'react-router-dom';

const KomunitasMental = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#A0A9FF] via-[#6E7AE2] to-[#1E498E] py-20 px-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-[30rem] h-[30rem] bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[35rem] h-[35rem] bg-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-16 relative animate-fadeIn">
        <div className="text-center space-y-6 px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
            Komunitas Mental
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
            Bergabunglah dengan komunitas yang peduli tentang kesehatan mental dan berbagi pengalaman Anda
          </p>
          <div className="w-20 h-0.5 bg-white/30 mx-auto mt-6"></div>
        </div>
      </div>

      {/* Cards Container */}
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-center gap-8 lg:gap-12 items-stretch px-4">
        {/* Card Teman Dukungan */}
        <div className="w-full lg:w-1/2 max-w-xl mx-auto animate-slideInLeft">
          <div className="group h-full bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl 
                         border border-white/20 transform transition-all duration-500 
                         hover:scale-[1.02] hover:bg-white/20">
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
            
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
              Teman Dukungan
            </h2>
            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 min-h-[96px]">
              Pengguna bisa berinteraksi dengan sesama yang memiliki pengalaman atau kondisi serupa, 
              di mana mereka bisa saling berbagi pengalaman atau tips kesehatan mental.
            </p>
            
            <button 
              onClick={() => navigate('/teman-dukungan')}
              className="w-full bg-white/10 backdrop-blur text-white font-medium px-6 py-3.5 rounded-xl
                         border border-white/20 transition-all duration-300 
                         hover:bg-white hover:text-blue-600 hover:shadow-lg 
                         transform hover:-translate-y-1"
            >
              Cari Teman Dukungan
            </button>
          </div>
        </div>

        {/* Card Bagikan Cerita */}
        <div className="w-full lg:w-1/2 max-w-xl mx-auto animate-slideInRight">
          <div className="group h-full bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl 
                         border border-white/20 transform transition-all duration-500 
                         hover:scale-[1.02] hover:bg-white/20">
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
            
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
              Bagikan Cerita
            </h2>
            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 min-h-[96px]">
              Pengguna dapat merekam "cerita" mereka dari awal hingga akhir perjalanan mental mereka, 
              yang bersifat pribadi atau bisa di-share secara anonim untuk inspirasi orang lain.
            </p>
            
            <button 
              onClick={() => navigate('/BagikanCerita')}
              className="w-full bg-white/10 backdrop-blur text-white font-medium px-6 py-3.5 rounded-xl
                         border border-white/20 transition-all duration-300 
                         hover:bg-white hover:text-blue-600 hover:shadow-lg 
                         transform hover:-translate-y-1" 
            >
              Bagikan Cerita
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KomunitasMental 