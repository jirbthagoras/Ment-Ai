import Komunitas1 from '../assets/komunitas-1.png'
import Komunitas2 from '../assets/komunitas2.png'
const CommunitySection = () => {
  return (
<section className="min-h-screen bg-gradient-to-b from-[#A0A9FF] to-[#1E498E] pt-32" id='Komunitas'>
  <h1 className="text-5xl font-bold text-white mb-12 text-center">Komunitas</h1>
  <div className="flex flex-col justify-center sm:flex-row gap-36 h-auto items-center">
    {/* Card Teman Dukungan */}
    <div className="flex flex-col items-center">
    <div className="bg-white p-6 rounded-3xl shadow-lg w-96 text-center min-h-[400px] flex flex-col transform transition-transform duration-300 hover:scale-95">
  <h2 className="text-xl font-extrabold text-[#2A386A] mb-4">Teman Dukungan</h2> {/* Menambahkan margin-bottom */}
  <div>
    <img
      src={Komunitas2} // Ganti dengan path gambar Teman Dukungan
      alt="Teman Dukungan"
      className="mx-auto mb-4"
    />
    <p className="text-gray-600 mb-6">
      Pengguna bisa berinteraksi dengan sesama yang memiliki pengalaman atau kondisi serupa, di mana mereka bisa saling berbagi pengalaman atau tips kesehatan mental.
    </p>
  </div>
</div>
      {/* Tombol di luar card Teman Dukungan */}
      <button className="bg-blue-100 items-center justify-center flex mx-auto text-blue-600 font-bold px-4 py-1 mt-2 rounded-lg hover:bg-blue-200 transition duration-300">
        Cari Artikel
      </button>
    </div>

    {/* Card Bagikan Cerita */}
    <div className="flex flex-col items-center">
      <div className="bg-white p-6 rounded-3xl shadow-lg w-96 text-center min-h-[400px] flex flex-col justify-between transform transition-transform duration-300 hover:scale-95">
      <h2 className="text-xl font-extrabold text-[#2A386A] mb-4">Bagikan Cerita</h2>
        <div>
          <img
            src={Komunitas1} // Ganti dengan path gambar Bagikan Cerita
            alt="Bagikan Cerita"
            className="mx-auto mb-4"
          />

          <p className="text-gray-600 mb-6">
            Pengguna dapat merekam &quot;cerita&quot; mereka dari awal hingga akhir perjalanan mental mereka, yang bersifat pribadi atau bisa di-share secara anonim untuk inspirasi orang lain.
          </p>
        </div>
      </div>
      {/* Tombol di luar card Bagikan Cerita */}
      <button className="bg-white font-bold text-blue-500 px-6 py-1 mt-4 rounded-lg hover:bg-[#A0A9FF] hover:opacity-90 duration-500 ease-in-out transition">
        Bagikan Cerita
      </button>
    </div>
  </div>
</section>

  )
}

export default CommunitySection
