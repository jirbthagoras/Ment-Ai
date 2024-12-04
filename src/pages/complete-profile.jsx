'use client'

import { useState } from 'react';
import { auth } from '../firebase';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import MedicalQuiz from '../components/MedicalQuiz';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiArrowRight, FiCheck } from 'react-icons/fi';
import { FaArrowLeft } from 'react-icons/fa';

const CompleteProfile = () => {
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Medical Info
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [medicalInfo, setMedicalInfo] = useState({
    riwayatKonsultasi: '',
    keluhanUtama: '',
    riwayatPengobatan: '',
    kondisiMental: '',
    tingkatStress: '1',
    kualitasTidur: '',
    dukunganKeluarga: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const db = getFirestore();
  const navigate = useNavigate();

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleNextStep = () => {
    if (!validateBasicInfo()) return;
    setStep(2);
  };

  const validateBasicInfo = () => {
    if (!username.trim() || !email.trim() || !phone.trim() || !address.trim() || !birthDate) {
      setError("Please fill in all fields.");
      return false;
    }

    if (username.length > 30) {
      setError("Username must be less than 30 characters.");
      return false;
    }

    const age = calculateAge(birthDate);
    if (age < 13) {
      setError("You must be at least 13 years old to use this service.");
      return false;
    }
    if (age > 120) {
      setError("Please enter a valid birth date.");
      return false;
    }

    setError('');
    return true;
  };

  const handleMedicalInfoChange = (e) => {
    const { name, value } = e.target;
    setMedicalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateBasicInfo()) return;

    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("No authenticated user found");

      await setDoc(doc(db, 'users', user.uid), {
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        birthDate: birthDate,
        age: calculateAge(birthDate),
        isAdmin: false,
        profileImage: profileImageUrl,
        medicalInfo: {
          ...medicalInfo,
          lastUpdated: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('Profile completed successfully');
      navigate('/');
    } catch (err) {
      setError(err.message || "An error occurred while saving your profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8e94f2] via-[#4e54c8] to-[#1e4287] px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="pt-16 text-3xl sm:text-4xl font-bold text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-base sm:text-lg text-blue-100">
            Help us understand you better
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-white text-blue-600' : 'bg-blue-200 text-blue-400'
              }`}>
                <FiUser className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className={`ml-2 sm:ml-3 text-sm sm:text-base font-medium ${
                step >= 1 ? 'text-white' : 'text-blue-200'
              }`}>Basic Info</span>
            </div>
            <div className="flex-1 mx-2 sm:mx-4 h-1 bg-blue-200 rounded hidden sm:block">
              <div 
                className="h-full bg-white rounded transition-all duration-500"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
            <div className="flex items-center">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-white text-blue-600' : 'bg-blue-200 text-blue-400'
              }`}>
                <FiUser className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className={`ml-2 sm:ml-3 text-sm sm:text-base font-medium ${
                step >= 2 ? 'text-white' : 'text-blue-200'
              }`}>Health Info</span>
            </div>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-lg text-sm sm:text-base"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8">
                Personal Information
              </h2>
              
              <div className="grid gap-6 sm:gap-8">
                <div className="flex justify-center">
                  <ImageUploader onImageUrlChange={(url) => setProfileImageUrl(url)} />
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        maxLength={30}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiPhone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      Birth Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        required
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base mt-4 sm:mt-6"
                >
                  <span>Continue to Health Information</span>
                  <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              {/* Header with Back Button and Title */}
              <div className="space-y-6 mb-8">
                {/* Back Button */}
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setStep(1)}
                  className="group flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200 mr-2">
                    <FaArrowLeft className="w-4 h-4 group-hover:text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Kembali ke Informasi Dasar</span>
                </motion.button>

                {/* Centered Title Section */}
                <div className="text-center">
                  <motion.h2 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3"
                  >
                    Mental Health Assessment
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto"
                  >
                    Bantu kami memahami kondisi kesehatan mental Anda melalui beberapa pertanyaan berikut
                  </motion.p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-200 mb-8" />
              
              <MedicalQuiz 
                medicalInfo={medicalInfo}
                onChange={handleMedicalInfoChange}
              />

              <button 
                onClick={handleSubmit}
                disabled={isLoading}
                className={`w-full mt-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <span>Selesai</span>
                    <FiCheck className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompleteProfile; 