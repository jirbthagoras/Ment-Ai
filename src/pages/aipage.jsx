import React, { useState } from "react"
import { IoArrowBack, IoSend, IoSparkles } from "react-icons/io5"
import { FaHeart } from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"

export default function AiPage() {
  const [message, setMessage] = useState("")
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "Dr. Men", text: "Hai sobat! bagaimana kabarmu kali ini, aku harap kamu baik - baik sajaa! adakah yang ingin kamu ceritakan padaku?" },
    { id: 2, sender: "Sobat Cerita", text: "Hai dr, apa kabar!?" },
  ])

  const navigate = useNavigate()

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatMessages([...chatMessages, { id: chatMessages.length + 1, sender: "Sobat Cerita", text: message }])
      setMessage("")
    } else {
      alert("Please enter a message.")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-pink-300 via-purple-400 to-blue-600 p-6"
    >
      <div className="max-w-4xl mx-auto">
        <motion.a
          onClick={() => navigate(-1)}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center text-indigo-900 hover:text-indigo-700 mb-6 cursor-pointer"
        >
          {/* <IoArrowBack className="w-4 h-4 mr-1" /> */}
          {/* <span className="text-sm italic">Kembali</span> */}
        </motion.a>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <AnimatePresence>
              {chatMessages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {msg.sender === "Dr. Men" ? (
                    <div>
                      <div className="text-sm text-white/80 mb-2">{msg.sender}</div>
                      <div className="bg-white rounded-2xl rounded-tl-none p-4 text-sm text-gray-800 max-w-[90%] shadow-lg">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <div className="bg-white/90 rounded-2xl rounded-tr-none p-4 text-sm text-gray-800 max-w-[70%] shadow-lg">
                        {msg.text}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative mt-auto"
            >
              <div className="relative max-w-xl">
                <input
                  type="text"
                  placeholder="Haii, apa yang kamu rasakan hari ini sobat?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="w-full bg-white rounded-xl border-0 pr-14 py-3 text-gray-800 placeholder-gray-500 shadow-lg block"
                  aria-label="Message input"
                />
                            {/* <input type="tel" id="phone" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="123-45-678" pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}" required /> */}
                <button
                  onClick={handleSendMessage}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white/90"
                  aria-label="Send message"
                >
                  <IoSend className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
            className="flex flex-col items-center justify-center relative"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 2,
                }}
                className="absolute -top-8 -right-8 text-white text-4xl"
              >
                <IoSparkles />
              </motion.div>
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 1.5,
                }}
                className="absolute -top-4 -right-4 text-pink-400 text-2xl"
              >
                <FaHeart />
              </motion.div>
            </div>

            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              src="src\assets\Mascot.png"
              alt="Dr. Men - Owl Doctor Character"
              className="ml-20 w-250 h-250 drop-shadow-xl mb-4"
            />

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <h2 className="ml-20 text-2xl font-semibold text-white mb-1">Dr. Men</h2>
              <p className="ml-20 text-sm text-white/90">Teman ternyaman kamu untuk bercerita</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
