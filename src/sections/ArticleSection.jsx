import Moodswing from '../assets/poster/moodswing.png';
import Trauma from '../assets/poster/trauma.png';
import Depresi from '../assets/poster/depressionpos.png';
import Kecanduan from '../assets/poster/kecanduan.png';
import Stress from '../assets/poster/stresspost.png';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';


function ArtikelCard({ title, imageSrc, style }) {
  const navigate = useNavigate();

  const handleReadMore = () => {
    const articleId = title.toLowerCase();
    navigate(`/artikel/${articleId}`);
  };

  return (
    <div
      className="bg-white rounded-3xl shadow-xl w-full max-w-[320px] sm:max-w-[280px] lg:w-64 
      h-[400px] relative overflow-hidden group 
      hover:scale-[1.03] hover:shadow-2xl hover:shadow-blue-500/20 
      transition-all duration-500 ease-out cursor-pointer"
      style={style}
    >
      {/* Full card image with overlay */}
      <div className="absolute inset-0">
        <img 
          src={imageSrc} 
          alt={title} 
          className="w-full h-full object-cover transform group-hover:scale-[1.15] transition-all duration-700 ease-out" 
        />
        
        {/* Multiple gradient overlays for better depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 
          opacity-50 group-hover:opacity-80 transition-all duration-500"/>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-purple-800/40 
          mix-blend-overlay opacity-0 group-hover:opacity-100 transition-all duration-500"/>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 
          backdrop-blur-[2px] transition-all duration-500"/>
      </div>

      {/* Content container */}
      <div className="relative h-full flex flex-col justify-end p-6 z-10">
        {/* Category tag */}
        <div className="bg-white/25 backdrop-blur-md text-white px-3 py-1 rounded-full w-fit
          mb-3 text-xs font-medium tracking-wider
          transform -translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 
          transition-all duration-500 hover:bg-white/30">
          Artikel Kesehatan
        </div>
        
        {/* Title */}
        <h2 className="text-white font-bold text-2xl mb-3
          transform translate-y-8 group-hover:translate-y-0
          transition-all duration-500 drop-shadow-lg group-hover:text-blue-100">
          {title}
        </h2>

        {/* Description - New! */}
        <p className="text-white/90 mb-4 text-sm line-clamp-2
          transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
          transition-all duration-500 delay-75 group-hover:text-blue-50">
          Pelajari lebih lanjut tentang {title} dan bagaimana cara menanganinya dalam kehidupan sehari-hari.
        </p>

        {/* Button with resolved conflicts */}
        <button 
          onClick={handleReadMore}
          className="w-full py-3 bg-white/95 rounded-xl text-blue-600 font-semibold text-sm
            hover:bg-blue-50
            active:scale-95 
            shadow-lg hover:shadow-xl backdrop-blur-sm
            flex items-center justify-center gap-2 group/btn
            transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 
            transition-all duration-300
            hover:text-blue-700"
        >
          <span>Baca Selengkapnya</span>
          <svg 
            className="w-4 h-4 transform group-hover/btn:translate-x-2 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ArticleSection() {
  const artikelData = [
    { title: "Depresi", imageSrc: Depresi, style: { marginTop: '0px' } },
    { title: "Stress", imageSrc: Stress, style: { marginTop: '50px' } },
    { title: "MoodSwing", imageSrc: Moodswing, style: { marginTop: '150px' } },
    { title: "Trauma", imageSrc: Trauma, style: { marginTop: '100px' } },
    { title: "Kecanduan", imageSrc: Kecanduan, style: { marginTop: '0px' } },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#1E498E] via-[#A0A9FF] to-[#1E498E] 
      flex flex-col items-center py-16 relative">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 md:mb-12 text-center">
        Ayo Kenali Artikel!
      </h1>
      
      {/* Responsive grid container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8 px-4">
          {artikelData.map((artikel, index) => (
            <div key={index} className={`
              flex justify-center
              ${index === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}
              ${index >= 3 ? 'sm:hidden lg:block' : ''}
              transform transition-all duration-500 hover:z-10
              ${artikel.style.marginTop !== '0px' ? 
                `lg:translate-y-[${artikel.style.marginTop.replace('px', '')}px]` : ''}
            `}>
              <ArtikelCard 
                title={artikel.title} 
                imageSrc={artikel.imageSrc} 
                className="w-full max-w-[280px] mx-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

ArtikelCard.propTypes = {
  title: PropTypes.string.isRequired,
  imageSrc: PropTypes.string.isRequired,
  style: PropTypes.object
};

// Optional: Add default props
ArtikelCard.defaultProps = {
  style: {}
};

export default ArticleSection;
