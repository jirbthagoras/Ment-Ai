import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import doctorImage from '../assets/psikiater.png';
import mascot from '../assets/Mascot.png';

const ConsultationSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <section className="bg-gradient-to-b from-[#1E498E] to-[#A0A9FF]">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col gap-16">
          {/* Psychiatrist Card */}
          <div className="flex flex-col md:flex-row items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ duration: 0.5 }}
              className="relative w-full md:w-[300px] h-[400px] cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-[32px] overflow-hidden"
              >
                <img
                  src={doctorImage}
                  alt="Doctor"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#02005C] to-transparent" />
              </motion.div>

              <div className="absolute bottom-4 left-4 z-20">
                <span className="text-white/80 font-medium">Psikiater</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="ml-0 md:ml-12 mt-4 md:mt-0"
            >
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Konsultasi Psikiater
              </h3>
              <p className="text-white/90 text-lg mb-6 leading-relaxed">
                Hai perkenalkan sobat mentai<br />
                Psikiater profesional kami<br />
                untuk mengatasi kesehatan<br />
                mental generasi muda
              </p>
              <Link to="/Konsultasi">
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: '#f0f0f0' }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white px-6 py-2 rounded-full font-medium shadow-lg"
                >
                  Konsultasi
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Dr.Men Card */}
          <div className="flex flex-col md:flex-row items-center justify-end">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mr-0 md:mr-12 text-right"
            >
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Dr.Men
              </h3>
              <p className="text-white/90 text-lg mb-6 leading-relaxed">
                Hai perkenalkan sobat ment&apos;ai<br />
                sebuah Artificial Intelligence untuk<br />
                mengatasi kesehatan mental<br />
                generasi muda, teman terbaik, dan<br />
                pendengar terbaik bagi diri kamu
              </p>
              <Link to="/aipage">
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: '#f0f0f0' }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white px-6 py-2 rounded-full font-medium shadow-lg"
                >
                  Konsultasi
                </motion.button>
              </Link>
            </motion.div>

            <div className="relative w-full md:w-[300px] h-[400px]">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-[32px] overflow-hidden"
              >
                <img
                  src={mascot}
                  alt="Dr.Men Owl"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#02005C] to-transparent" />
              </motion.div>

              <div className="absolute bottom-4 right-4 z-20">
                <span className="text-white/80 font-medium">Dr. Men</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Consultation */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Konsultasi</h2>
            <p className="mb-4">Silakan isi form di bawah ini untuk konsultasi.</p>
            {/* Add your form here */}
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleCloseModal}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ConsultationSection;
