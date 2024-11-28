import { useState } from 'react';
import { FaRegSmile } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdAttach } from 'react-icons/io';
import { MdOutlineMoreVert } from 'react-icons/md';

export default function ConsultationRoom() {
  const [message, setMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Handle sending message
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] lg:h-[calc(100vh-8rem)]">
          {/* Header */}
          <motion.div 
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="bg-[#003399] p-4 shadow-lg"
          >
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-white text-2xl font-bold">RUANG KONSULTASI</h1>
              <button className="p-2 hover:bg-[#004499] rounded-full transition-colors">
                <MdOutlineMoreVert className="text-2xl text-white" />
              </button>
            </div>
          </motion.div>

          {/* Doctor Info Card */}
          <div className="p-4">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 rounded-xl p-6 shadow-md"
            >
              <div className="flex items-center gap-4 mb-4">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-[#003399]/10 rounded-full flex items-center justify-center"
                >
                  <span className="text-2xl">👨‍⚕️</span>
                </motion.div>
                <div>
                  <h2 className="text-[#003399] font-semibold text-lg">dr. Stevanus Ingwantoro, Sp.KJ</h2>
                  <p className="text-sm text-gray-500">Online - Ready to help</p>
                </div>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow-sm"
              >
                Selamat Pagi. Hal pertama/kan saya dr. Stevanus Ingwantoro, Sp.KJ 
                yang akan memimpin sesi konsultasi kamu pada saat ini di 
                pelayanan psikiatri. Kami pastikan bahwa saya akan memberikan 
                pelayanan konsultasi psikiatri terhadap anda. Semoga saya bisa 
                membantu anda dalam menghidupi masalah yang anda hadapi.
                <br />
                <span className="text-[#003399] font-medium">Salam Hangat dr. Akbar !</span>
              </motion.p>
            </motion.div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <AnimatePresence>
              {/* Messages will be rendered here */}
            </AnimatePresence>
          </div>

          {/* Chat Input */}
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="p-4 bg-white border-t border-gray-200"
          >
            <form onSubmit={handleSendMessage} className="max-w-7xl mx-auto flex gap-3">
              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-gray-100 rounded-full shadow-inner flex items-center px-4"
              >
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button" 
                  className="p-2"
                >
                  <FaRegSmile className="text-gray-500 text-xl" />
                </motion.button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 py-3 px-2 bg-transparent outline-none"
                />
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button" 
                  className="p-2"
                >
                  <IoMdAttach className="text-gray-500 text-xl rotate-45" />
                </motion.button>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-[#003399] text-white p-4 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
              >
                <IoSend />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 