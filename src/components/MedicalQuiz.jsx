import PropTypes from 'prop-types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { FiCheck } from 'react-icons/fi';

// Variasi animasi untuk kontainer
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      staggerChildren: 0.1 
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const questionVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const optionVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: (index) => ({ 
    opacity: 1,
    y: 0,
    transition: { 
      delay: index * 0.1,
      duration: 0.3
    }
  }),
  hover: { 
    scale: 1.02,
    backgroundColor: 'rgb(239 246 255)',
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  },
  selected: {
    scale: 1,
    backgroundColor: 'rgb(239 246 255)',
    borderColor: 'rgb(59 130 246)',
    transition: { duration: 0.2 }
  }
};

const MedicalQuiz = ({ medicalInfo, onChange }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [direction, setDirection] = useState(0); // -1 untuk prev, 1 untuk next

  const questions = [
    {
      id: 'keluhanUtama',
      title: "Keluhan Utama",
      question: "Apa keluhan utama yang Anda rasakan saat ini?",
      description: "Pilih keluhan yang paling mengganggu aktivitas sehari-hari Anda",
      type: "options",
      options: [
        { value: "stress", label: "Stress", icon: "😫" },
        { value: "anxiety", label: "Kecemasan", icon: "😰" },
        { value: "depression", label: "Depresi", icon: "😢" },
        { value: "insomnia", label: "Gangguan Tidur", icon: "😴" },
        { value: "other", label: "Lainnya", icon: "🤔" }
      ]
    },
    {
      id: 'tingkatStress',
      title: "Tingkat Stress",
      question: "Seberapa sering Anda merasa stress dalam sebulan terakhir?",
      description: "Evaluasi tingkat stress Anda dalam 30 hari terakhir",
      type: "options",
      options: [
        { value: "1", label: "Tidak Pernah", icon: "😊" },
        { value: "2", label: "Jarang", icon: "🙂" },
        { value: "3", label: "Kadang-kadang", icon: "😐" },
        { value: "4", label: "Sering", icon: "😟" },
        { value: "5", label: "Sangat Sering", icon: "😩" }
      ]
    },
    {
      id: 'kualitasTidur',
      title: "Kualitas Tidur",
      question: "Bagaimana kualitas tidur Anda dalam seminggu terakhir?",
      type: "options",
      options: [
        { value: "baik", label: "Baik (>7 jam/hari)", icon: "😌" },
        { value: "cukup", label: "Cukup (6-7 jam/hari)", icon: "🙂" },
        { value: "kurang", label: "Kurang (4-5 jam/hari)", icon: "😴" },
        { value: "buruk", label: "Buruk (<4 jam/hari)", icon: "😪" }
      ]
    },
    {
      id: 'dukunganKeluarga',
      title: "Dukungan Sosial",
      question: "Bagaimana dukungan dari keluarga/teman terdekat Anda?",
      type: "options",
      options: [
        { value: "sangat-mendukung", label: "Sangat Mendukung", icon: "💖" },
        { value: "cukup-mendukung", label: "Cukup Mendukung", icon: "🤗" },
        { value: "kurang-mendukung", label: "Kurang Mendukung", icon: "🙁" },
        { value: "tidak-mendukung", label: "Tidak Mendukung", icon: "🤬" }
      ]
    },
    {
      id: 'riwayatKonsultasi',
      title: "Riwayat Konsultasi",
      question: "Apakah Anda pernah berkonsultasi dengan psikolog/psikiater sebelumnya?",
      type: "options",
      options: [
        { value: "belum-pernah", label: "Belum Pernah", icon: "🤷‍♂️" },
        { value: "sedang-konsultasi", label: "Sedang Dalam Konsultasi", icon: "👩‍⚕️" },
        { value: "pernah", label: "Pernah", icon: "🤓" }
      ]
    }
  ];

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setDirection(1);
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isOptionSelected = (questionId) => {
    return medicalInfo[questionId] !== '';
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Progress Bar with Steps */}
      <div className="relative pt-1">
        <div className="flex mb-4 items-center justify-between">
          {questions.map((_, index) => (
            <motion.div
              key={index}
              className={`flex flex-col items-center ${
                index <= currentQuestion ? 'text-blue-600' : 'text-gray-400'
              }`}
              whileHover={{ scale: 1.1 }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${index <= currentQuestion 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-300'}`}
              >
                {index < currentQuestion ? (
                  <FiCheck className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="hidden sm:block text-xs mt-1">
                {questions[index].title}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-blue-100 rounded-full">
          <motion.div
            className="h-full bg-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentQuestion / (questions.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Questions Container */}
      <div className="relative overflow-hidden min-h-[400px]">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={currentQuestion}
            custom={direction}
            variants={questionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute w-full"
          >
            {/* Question Header */}
            <motion.div 
              className="text-center space-y-3 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {questions[currentQuestion].title}
              </h3>
              <p className="text-gray-600 text-lg">
                {questions[currentQuestion].question}
              </p>
              {questions[currentQuestion].description && (
                <p className="text-sm text-gray-500 italic">
                  {questions[currentQuestion].description}
                </p>
              )}
            </motion.div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={option.value}
                  variants={optionVariants}
                  custom={index}
                  whileHover="hover"
                  whileTap="tap"
                  initial="hidden"
                  animate="visible"
                  onClick={() => onChange({ 
                    target: { 
                      name: questions[currentQuestion].id, 
                      value: option.value 
                    }
                  })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center
                    ${medicalInfo[questions[currentQuestion].id] === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                      : 'border-gray-200 hover:border-blue-200'
                    }`}
                >
                  <span className="text-2xl sm:text-3xl mr-3">{option.icon}</span>
                  <span className="flex-grow text-left">{option.label}</span>
                  {medicalInfo[questions[currentQuestion].id] === option.value && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <FiCheck className="w-5 h-5 text-blue-500" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <motion.div 
        className="flex justify-between items-center pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrev}
          disabled={currentQuestion === 0}
          className={`flex items-center px-6 py-2 rounded-lg transition-colors duration-200
            ${currentQuestion === 0
              ? 'text-gray-400 cursor-not-allowed opacity-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
        >
          <FaArrowLeft className="mr-2" /> Sebelumnya
        </motion.button>
        
        <span className="text-sm text-gray-500">
          {currentQuestion + 1} dari {questions.length}
        </span>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={currentQuestion === questions.length - 1 || !isOptionSelected(questions[currentQuestion].id)}
          className={`flex items-center px-6 py-2 rounded-lg transition-colors duration-200
            ${currentQuestion === questions.length - 1 || !isOptionSelected(questions[currentQuestion].id)
              ? 'text-gray-400 cursor-not-allowed opacity-50'
              : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
        >
          Selanjutnya <FaArrowRight className="ml-2" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// Menambahkan PropTypes validation
MedicalQuiz.propTypes = {
  medicalInfo: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

export default MedicalQuiz; 