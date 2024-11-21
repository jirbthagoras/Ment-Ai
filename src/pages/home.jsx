import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import depresiImg from '../assets/mood/Depresi.png';
import kecanduanImg from '../assets/mood/Kecanduan.png';
import moodswingImg from '../assets/mood/MoodSwing.png';
import stressImg from '../assets/mood/Stress.png';
import traumaImg from '../assets/mood/Trauma.png';
import ConsultationSection from '../sections/ConsultationSection';

export default function Home() {
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const [hoveredCard, setHoveredCard] = useState(null);

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
        when: "beforeChildren"
      }
    }
  };

  const heroTextVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    hover: {
      y: -15,
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const cardBgVariants = {
    hover: {
      scale: 1.2,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const conditions = [
    {
      id: 1,
      name: 'Depresi',
      image: depresiImg,
      description: 'Depresi adalah kondisi mental yang serius namun dapat diobati. Jika kamu merasa kehilangan minat, kesulitan tidur, atau memiliki pikiran negatif selama lebih dari 2 minggu, jangan ragu untuk mencari bantuan. Kamu tidak sendirian dalam menghadapi ini. 💙',
      symptoms: ['Perasaan sedih berkepanjangan', 'Kehilangan minat', 'Gangguan tidur', 'Pikiran negatif', 'Kelelahan mental']
    },
    {
      id: 2,
      name: 'Stress',
      image: stressImg,
      description: 'Stress adalah respons alami tubuh terhadap tekanan, namun jika berlebihan dapat mempengaruhi kesehatan mental dan fisik. Kenali tanda-tandanya dan kelola stress dengan tepat untuk hidup yang lebih seimbang. 🌿',
      symptoms: ['Mudah cemas', 'Sulit berkonsentrasi', 'Ketegangan otot', 'Perubahan nafsu makan', 'Gangguan tidur']
    },
    {
      id: 3,
      name: 'Moodswing',
      image: moodswingImg,
      description: 'Moodswing atau perubahan suasana hati yang drastis bisa mempengaruhi kehidupan sehari-hari. Penting untuk mengenali pola perubahan mood dan mencari cara sehat untuk mengelolanya. 🎭',
      symptoms: ['Perubahan emosi tiba-tiba', 'Sensitifitas tinggi', 'Energi naik-turun', 'Perubahan perilaku', 'Kesulitan mengontrol emosi']
    },
    {
      id: 4,
      name: 'Trauma',
      image: traumaImg,
      description: 'Trauma adalah bekas luka emosional yang dapat mempengaruhi kesehatan mental jangka panjang. Dengan dukungan yang tepat dan penanganan profesional, pemulihan dari trauma adalah sesuatu yang mungkin. 🌅',
      symptoms: ['Flashback kejadian', 'Mimpi buruk', 'Kecemasan berlebih', 'Menghindari tempat/situasi tertentu', 'Kesulitan percaya']
    },
    {
      id: 5,
      name: 'Kecanduan',
      image: kecanduanImg,
      description: 'Kecanduan adalah kondisi kompleks yang mempengaruhi otak dan perilaku. Meski sulit, dengan tekad dan bantuan profesional, kecanduan dapat diatasi. Langkah pertama adalah mengakui dan mencari bantuan. 🌟',
      symptoms: ['Kehilangan kontrol', 'Perubahan prioritas', 'Gejala putus zat', 'Pengabaian tanggung jawab', 'Isolasi sosial']
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFA7D0] via-[#1E498E] to-[#A0A9FF] font-jakarta">

      <motion.div
        className="relative min-h-screen overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>

        <div className="container mx-auto px-4 min-h-screen">
          <div className="pt-32 pb-16">
            <motion.div
              className="flex flex-col justify-center"
              style={{ y, opacity }}
            >
              <motion.h1
                variants={heroTextVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 relative"
              >
                Haii Sobat Mentai,
                <motion.span
                  className="absolute -left-4 -top-4 w-20 h-20 bg-pink-500/10 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </motion.h1>
              <motion.h2
                variants={heroTextVariants}
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 relative"
              >
                Bagaimana Kabar Kamu Hari Ini?
                <motion.span
                  className="absolute -left-4 -top-4 w-20 h-20 bg-pink-500/10 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </motion.h2>
              <motion.p
                variants={heroTextVariants}
                className="text-xl md:text-2xl text-white mb-12 relative"
              >
                Kenali perasaan mu
                <motion.span
                  className="absolute -left-4 -top-4 w-20 h-20 bg-pink-500/10 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </motion.p>

              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-8"
                variants={cardContainerVariants}
              >
                {conditions.map((condition) => (
                  <motion.button
                    key={condition.id}
                    variants={cardVariants}
                    whileHover="hover"
                    onClick={() => setSelectedCondition(condition.name)}
                    onHoverStart={() => setHoveredCard(condition.id)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className={`relative h-48 md:h-64 overflow-hidden rounded-[32px] transition-all duration-300
                      ${selectedCondition === condition.name ? 'ring-4 ring-white/50' : ''}
                      group shadow-lg backdrop-blur-sm`}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-blue-600/20"
                      variants={cardBgVariants}
                    />

                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      variants={cardBgVariants}
                    >
                      <img
                        src={condition.image}
                        alt={condition.name}
                        className="w-full h-full object-contain p-4 transition-transform duration-300"
                      />
                    </motion.div>

                    <div
                      className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#001E81] to-transparent"
                      style={{
                        background: 'linear-gradient(to top, rgba(0, 30, 129, 0.8) 20%, rgba(0, 30, 129, 0.5) 70%, transparent 100%)'
                      }}
                    />

                    <motion.div
                      className="absolute bottom-0 left-0 right-0 p-4 md:p-6"
                      whileHover={{ y: -5 }}
                    >
                      <motion.span
                        className="text-white text-lg md:text-2xl font-medium block"
                        whileHover={{ scale: 1.05 }}
                      >
                        {condition.name}
                      </motion.span>
                    </motion.div>

                    <motion.div
                      className="absolute top-4 right-4 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {selectedCondition && (
              <motion.div
                key={selectedCondition}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="mb-16"
              >
                <motion.h2
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl md:text-3xl font-bold mb-6 uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-pink-300"
                >
                  {selectedCondition}
                </motion.h2>

                <motion.div
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden"
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-purple-500/5"
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                      duration: 15,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />

                  <div className="relative z-10">
                    <motion.p
                      className="text-white text-base md:text-lg mb-8 leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {conditions.find(c => c.name === selectedCondition)?.description}
                    </motion.p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      {conditions.find(c => c.name === selectedCondition)?.symptoms.map((symptom, index) => (
                        <motion.div
                          key={symptom}
                          initial={{ opacity: 0,
                            x: -20
                          }}
                          animate={{
                            opacity: 1,
                            x: 0
                          }}
                          transition={{
                            delay: index * 0.1
                          }}
                          className="flex items-center space-x-3 group"
                        >
                          <motion.div
                            className="w-2 h-2 bg-pink-400 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.2
                            }}
                          />
                          <span className="text-white text-sm md:text-base group-hover:text-pink-300 transition-colors">
                            {symptom}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      className="mt-8 text-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.button
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 md:px-8 py-2 md:py-3 rounded-full text-sm md:text-base font-medium relative overflow-hidden group"
                        whileHover={{ boxShadow: "0 0 20px rgba(255,167,208,0.5)" }}
                      >
                        <span className="relative z-10">Konsultasi Sekarang</span>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500"
                          initial={{ x: "100%" }}
                          whileHover={{ x: 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="relative z-10 bg-transparent">
        <ConsultationSection />
      </div>

    </div>
  );
}
