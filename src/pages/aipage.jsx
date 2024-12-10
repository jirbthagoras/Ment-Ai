import { useState, useEffect } from "react";
import { IoSend, IoSparkles } from "react-icons/io5";
import { FaHeart, FaComments } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import talkani from '../assets/gif/Talk.mp4'
import idleani from '../assets/gif/Idle.mp4'
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: import.meta.env.VITE_GROQ_KEY, dangerouslyAllowBrowser: true });

// Add animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.5,
      staggerChildren: 0.1 
    }
  }
};

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.2 }
  }
};

export default function AiPage() {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "Dr. Men",
      text: "Hai sobat! bagaimana kabarmu kali ini, aku harap kamu baik - baik sajaa! adakah yang ingin kamu ceritakan padaku?",
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  const navigate = useNavigate();

  // Scroll to bottom effect
  useEffect(() => {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessages = [...chatMessages, { id: chatMessages.length + 1, sender: "Sobat Cerita", text: message }];
      setChatMessages(newMessages);
      setMessage("");
      setIsTyping(true);

      try {
        setIsTalking(false);
        const response = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "Bayangkan dirimu adalah seorang dokter psikiater yang bijaksana berwujud seekor burung hantu. Namamu adalah Dr. Men, dan kau memiliki sayap penuh kasih serta mata yang tajam dan penuh perhatian. Kau tinggal di sebuah ruang praktik yang hangat dan nyaman di dalam sebuah pohon besar, tempat pasien-pasienmu datang untuk bercerita dan mencurahkan isi hati. Kau sangat mencintai pekerjaanmu sebagai pendengar yang baik, memberikan nasihat yang lembut namun bermakna, serta membantu mereka menemukan ketenangan. Gunakan bahasa Indonesia yang baik dan benar saat berbicara, sehingga setiap pasien merasa dihargai dan dipahami." },
            ...newMessages.map((msg) => ({
              role: msg.sender === "Dr. Men" ? "assistant" : "user",
              content: msg.text,
            })),
          ],
          model: "llama3-8b-8192",
        });

        const aiReply = response.choices[0]?.message?.content || "Maaf, saya tidak bisa merespon saat ini.";
        
        // Start talking animation
        setIsTalking(true);
        setIsTyping(false);

        // Show typing effect gradually over 10 seconds
        let currentText = "";
        const words = aiReply.split(" ");
        const timePerWord = 10000 / words.length; // Distribute words over 10 seconds

        words.forEach((word, index) => {
          setTimeout(() => {
            currentText += (index === 0 ? "" : " ") + word;
            setChatMessages([
              ...newMessages,
              { id: newMessages.length + 1, sender: "Dr. Men", text: currentText },
            ]);

            // Stop talking animation after last word
            if (index === words.length - 1) {
              setTimeout(() => setIsTalking(false), 1000);
            }
          }, timePerWord * index);
        });

      } catch (error) {
        console.error("Error fetching AI response:", error);
        setIsTyping(false);
        setChatMessages([
          ...newMessages,
          { id: newMessages.length + 1, sender: "Dr. Men", text: "Maaf, terjadi kesalahan saat mencoba memberikan tanggapan." },
        ]);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#A0A9FF] p-4 sm:p-6 flex items-center justify-center"
    >
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center justify-items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-xl w-full max-w-xl order-2 lg:order-1"
          >
            <div 
              id="chat-container"
              className="space-y-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
            >
              <AnimatePresence mode='popLayout'>
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    {msg.sender === "Dr. Men" ? (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                          <FaComments className="text-white text-lg" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-white/80 mb-1">Dr. Men</div>
                          <div className="bg-white rounded-3xl rounded-tl-lg p-4 text-gray-800 shadow-lg max-w-[85%]">
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <div className="bg-white/90 text-gray-800 rounded-3xl rounded-tr-lg p-4 max-w-[85%] shadow-lg">
                          {msg.text}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white/70 text-sm"
                >
                  Dr. Men sedang mengetik...
                </motion.div>
              )}
            </div>

            <div className="relative mt-4">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Haii, apa yang kamu rasakan hari ini sobat?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="w-full bg-white/90 rounded-full border-0 pl-6 pr-16 py-4 text-gray-800 placeholder-gray-500 shadow-lg focus:ring-2 focus:ring-purple-400 transition-all duration-300"
                  aria-label="Message input"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSendMessage}
                  className="absolute right-2 flex items-center justify-center w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg transition-colors duration-300"
                  aria-label="Send message"
                >
                  <IoSend className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
            className="w-full max-w-[300px] sm:max-w-md flex flex-col items-center order-1 lg:order-2 mb-6 lg:mb-0"
          >
            <div className="relative w-full">
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

              <motion.video
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                src={isTalking ? talkani : idleani}
                alt="Dr. Men - Owl Doctor Character"
                className="w-[200px] sm:w-full max-w-md mx-auto bg-transparent object-contain rounded-3xl shadow-xl"
                style={{ 
                  backgroundColor: 'transparent',
                  objectFit: 'contain',
                }}
                autoPlay
                loop
                muted
                playsInline
              />

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center mt-4 sm:mt-6"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Dr. Men</h2>
                <p className="text-base sm:text-lg text-white/90">Teman ternyaman kamu untuk bercerita</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
