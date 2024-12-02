import Moodswing from '../assets/moodswingkomu.png';
import Trauma from '../assets/traumakomu.png';
import Depresi from '../assets/depresikomu.png';
import Kecanduan from '../assets/kecanduankomu.png';
import Stress from '../assets/stresskomu.png';
import PropTypes from 'prop-types';


function ArtikelCard({ title, imageSrc, style }) {
  return (
    <div>
      <div
        className="bg-white rounded-3xl shadow-lg w-52 h-96 flex flex-col items-center justify-between p-4 mb-4 hover:scale-105 transition-transform duration-300 relative"
        style={style}
      >
        {/* Gambar */}
        <div className="flex-grow flex items-center justify-center w-full">
          <img src={imageSrc} alt={title} className="w-full object-cover rounded-xl" />
        </div>

        {/* Judul */}
        <h2 className="text-white font-semibold text-lg mt-2 z-10">{title}</h2>

        {/* Efek Biru di Bawah Card */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#3D72B4] to-[#A0A9FF] h-12 rounded-b-3xl z-5"></div>
      </div>

      {/* Tombol di bawah card */}
      <button className="bg-blue-100 items-center justify-center flex mx-auto text-blue-600 font-bold px-6 py-0 mt-2 rounded-lg hover:bg-blue-200 transition duration-300">
        Cari Artikel
      </button>
    </div>
  );
}

function ArticleSection() {
  // Data untuk card (judul dan gambar)
  const artikelData = [
    { title: "Depresi", imageSrc: Depresi, style: { marginTop: '0px' } },
    { title: "Stress", imageSrc: Stress, style: { marginTop: '50px' } },
    { title: "MoodSwing", imageSrc: Moodswing, style: { marginTop: '150px' } },
    { title: "Trauma", imageSrc: Trauma, style: { marginTop: '100px' } },
    { title: "Kecanduan", imageSrc: Kecanduan, style: { marginTop: '0px' } },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#1E498E] via-[#A0A9FF] to-[#1E498E] flex flex-col items-center py-16 pt-24">
      <h1 className="text-4xl font-bold text-white mb-12">Ayo Kenali Artikel!</h1>
      <div className="flex flex-wrap justify-center gap-8">
        {artikelData.map((artikel, index) => (
          <ArtikelCard key={index} title={artikel.title} imageSrc={artikel.imageSrc} style={artikel.style} />
        ))}
      </div>
    </section>
  );
};

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
