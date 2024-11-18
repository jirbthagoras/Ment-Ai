import { motion } from 'framer-motion';
import doctorImage from '../assets/psikiater.png';
import owlImage from '../assets/mascot.png';

const ConsultationSection = () => {
  return (
    <section className="bg-gradient-to-b from-[#1E498E] to-[#A0A9FF]">
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col gap-16">
          {/* Psychiatrist Card */}
          <div className="flex items-center">
            <div className="relative w-[300px] h-[400px]">
              {/* Background Image Card */}
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
                {/* Gradient Overlay - now only at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#02005C] to-transparent" />
              </motion.div>
              
              {/* Text Overlay */}
              <div className="absolute bottom-4 left-4 z-20">
                <span className="text-white/80 font-medium">Psikiater</span>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="ml-12"
            >
              <h3 className="text-5xl font-bold text-white mb-4">
                Konsultasi Psikiater
              </h3>
              <p className="text-white/90 text-lg mb-6 leading-relaxed">
                Hai perkenalkan sobat mentai<br />
                Psikiater profesional kami<br />
                untuk mengatasi kesehatan<br />
                mental generasi muda
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white px-6 py-2 rounded-full font-medium shadow-lg"
              >
                Konsultasi
              </motion.button>
            </motion.div>
          </div>

          {/* Dr.Men Card */}
          <div className="flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="mr-12 text-right"
            >
              <h3 className="text-5xl font-bold text-white mb-4">
                Dr.Men
              </h3>
              <p className="text-white/90 text-lg mb-6 leading-relaxed">
                Hai perkenalkan sobat ment'ai<br />
                sebuah Artificial Intelligence untuk<br />
                mengatasi kesehatan mental<br />
                generasi muda, teman terbaik, dan<br />
                pendengar terbaik bagi diri kamu
              </p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white px-6 py-2 rounded-full font-medium shadow-lg"
              >
                Konsultasi
              </motion.button>
            </motion.div>

            <div className="relative w-[300px] h-[400px]">
              {/* Background Image Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-[32px] overflow-hidden"
              >
                <img 
                  src={owlImage} 
                  alt="Dr.Men Owl" 
                  className="w-full h-full object-cover" 
                />
                {/* Gradient Overlay - now only at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#02005C] to-transparent" />
              </motion.div>
              
              {/* Text Overlay */}
              <div className="absolute bottom-4 right-4 z-20">
                <span className="text-white/80 font-medium">Dr. Men</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConsultationSection; 