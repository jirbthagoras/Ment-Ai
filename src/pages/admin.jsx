'use client'

import { useEffect, useState } from 'react'
import { FaUser, FaComments, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa'
import { app, auth } from '../firebase'
import { getFirestore, collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore'
import { motion, AnimatePresence } from 'framer-motion'

const db = getFirestore(app)

const renderTags = (tags) => (
  tags.map((tag, tagIndex) => (
    <motion.span
      key={tagIndex}
      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: tagIndex * 0.1 }}
    >
      {tag}
    </motion.span>
  ))
)

const renderMessages = (messages) => {
  if (messages.length === 0) {
    return (
      <motion.div
        className="text-gray-500 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      >
        Belum ada pesan terbaru
      </motion.div>
    )
  }

  return messages.map((message, index) => (
    <motion.div
      key={index}
      className="bg-white rounded-lg p-4 shadow"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="font-medium text-gray-800">{message.patientName}</div>
          <p className="text-sm text-gray-600 mt-1">{message.message}</p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{message.status}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{message.type}</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">{message.time}</div>
      </div>
    </motion.div>
  ))
}

export default function Admin() {
  const [appointments, setAppointments] = useState([])
  const [messages, setMessages] = useState([])
  const [username, setUsername] = useState('')
  const [patientCount, setPatientCount] = useState(0)
  const [completedConsultations, setCompletedConsultations] = useState(0)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      } else {
        // Handle user not authenticated (e.g., redirect to login)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true)
        try {
          const appointmentsCollection = collection(db, 'appointments')
          const appointmentSnapshot = await getDocs(appointmentsCollection)
          const appointmentList = appointmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          setAppointments(appointmentList)

          const messagesCollection = collection(db, 'messages')
          const messageSnapshot = await getDocs(messagesCollection)
          const messageList = messageSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          setMessages(messageList)

          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUsername(userData.username)
          }

          const today = new Date()
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

          const patientQuery = query(collection(db, 'appointments'), where('date', '>=', startOfDay), where('date', '<', endOfDay))
          const patientSnapshot = await getDocs(patientQuery)
          setPatientCount(patientSnapshot.size)

          const completedQuery = query(collection(db, 'appointments'), where('status', '==', 'completed'))
          const completedSnapshot = await getDocs(completedQuery)
          setCompletedConsultations(completedSnapshot.size)
        } catch (error) {
          console.error("Error fetching data:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchData()
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#8e94f2] to-[#1e4287] flex items-center justify-center">
        <motion.div
          className="text-white text-4xl font-bold"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading...
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-[#8e94f2] to-[#1e4287] p-4 md:p-8 text-white font-jakarta"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex flex-col items-center mb-8"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="mt-52 text-4xl italic font-light text-center">Halo Selamat datang, <span className="font-bold">{username}</span></h1>
        <p className="mt-5 mb-32 text-3xl italic font-light opacity-90 text-center">Selamat Bekerja, Semoga hari mu indah</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          className="bg-white rounded-lg p-6 shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h2 className="text-4xl font-semibold text-purple-900 flex items-center justify-center mb-10">
            <FaCalendarAlt className="mr-2" />
            Upcoming Schedule
          </h2>
          <AnimatePresence>
            {appointments.length === 0 ? (
              <motion.div
                className="mt-20 text-purple-900 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Belum ada jadwal terbaru
              </motion.div>
            ) : (
              <motion.div
                className="space-y-4 max-h-[500px] overflow-y-auto pr-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {appointments.map((appointment, index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-lg p-4 shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 text-gray-800">
                          <FaUser className="text-blue-600" />
                          <span className="font-medium">{appointment.patientName}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {renderTags(appointment.tags)}
                        </div>
                        <div className="text-sm text-gray-500 mt-2">{appointment.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">{appointment.time}</div>
                        <motion.button
                          className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          ATTEND
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="mb-16 space-y-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <div className="bg-white/95 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">INFORMASI HARIAN</h2>
            <div className="text-lg font-semibold text-purple-900 mb-4">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            <motion.div
              className="bg-blue-50 rounded-lg p-4 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <FaComments className="text-blue-600" />
                New Message!
              </h3>
              <div className="space-y-4 max-h-[200px] pr-2">
                {renderMessages(messages)}
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="bg-blue-100 rounded-lg p-6 text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <div className="text-sm font-medium text-blue-900">Pasien Hari Ini</div>
                <motion.div
                  className="text-4xl font-bold text-blue-700 mt-2"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  {patientCount}
                </motion.div>
              </motion.div>
              <motion.div
                className="bg-blue-100 rounded-lg p-6 text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                <div className="text-sm font-medium text-blue-900">Selesai Konsultasi</div>
                <motion.div
                  className="text-4xl font-bold text-blue-700 mt-2"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.3 }}
                >
                  {completedConsultations}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}