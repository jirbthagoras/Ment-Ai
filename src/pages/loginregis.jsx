'use client'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaGoogle, FaEyeSlash, FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { auth, realtimeDb, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { doc, setDoc, getDoc } from 'firebase/firestore';

import logow from '../assets/LogoW.png';

export default function Component() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const provider = new GoogleAuthProvider()
  const navigate = useNavigate()

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, check their role
        checkUserRole(user.uid)
      }
    })

    return () => unsubscribe() // Cleanup subscription on unmount
  }, [navigate])

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      // Check if this is a new user
      const userDocRef = doc(db, 'users', user.uid)
      const userDocSnap = await getDoc(userDocRef)
      
      if (!userDocSnap.exists()) {
        // New Google user - save initial data
        await saveUserData(user.uid, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        })
      } else {
        // Existing user - update last login
        await setDoc(userDocRef, {
          lastLogin: new Date()
        }, { merge: true })
      }
      
      await checkUserRole(user.uid)
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login dibatalkan. Silakan coba lagi.')
      } else {
        console.error('Google login error:', err)
        setError('Terjadi kesalahan saat login dengan Google.')
      }
    }
  }

  const saveUserData = async (uid, userData) => {
    try {
      // Save to Firestore - user profile data
      const userDocRef = doc(db, 'users', uid)
      await setDoc(userDocRef, {
        email: userData.email,
        createdAt: new Date(),
        profileCompleted: false,
        lastLogin: new Date()
      }, { merge: true })

      // Save to Realtime Database - user status/role
      const userRef = ref(realtimeDb, `users/${uid}`)
      await set(userRef, {
        email: userData.email,
        isAdmin: false,
        createdAt: Date.now(),
        status: 'active'
      })
    } catch (error) {
      console.error('Error saving user data:', error)
      throw error
    }
  }

  const checkUserRole = async (uid) => {
    try {
      // Check Firestore first for user profile
      const userDocRef = doc(db, 'users', uid)
      const userDocSnap = await getDoc(userDocRef)
      
      // Check Realtime Database for role/status
      const userRef = ref(realtimeDb, `users/${uid}`)
      const realtimeSnap = await get(userRef)
      
      if (userDocSnap.exists() && realtimeSnap.exists()) {
        // User exists in both databases
        const firestoreData = userDocSnap.data()
        const realtimeData = realtimeSnap.val()
        
        if (realtimeData.isAdmin) {
          navigate('/admin')
        } else if (firestoreData.profileCompleted) {
          navigate('/profile')
        } else {
          navigate('/complete-profile')
        }
      } else if (!userDocSnap.exists()) {
        // New user - needs to complete profile
        navigate('/complete-profile')
      } else {
        throw new Error('User data inconsistency detected')
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      setError('Error verifying user status. Please try again.')
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError("Mohon isi semua field.")
      return
    }
    if (!isLogin && password !== confirmPassword) {
      setError("Password tidak cocok.")
      return
    }

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        // Update last login in Firestore
        const userDocRef = doc(db, 'users', userCredential.user.uid)
        await setDoc(userDocRef, {
          lastLogin: new Date()
        }, { merge: true })
        
        await checkUserRole(userCredential.user.uid)
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await saveUserData(userCredential.user.uid, {
          email: email
        })
        navigate('/complete-profile')
      }
    } catch (err) {
      console.error('Auth error:', err)
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Email sudah terdaftar.')
          break
        case 'auth/invalid-email':
          setError('Format email tidak valid.')
          break
        case 'auth/weak-password':
          setError('Password terlalu lemah. Minimal 6 karakter.')
          break
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Email atau password salah.')
          break
        default:
          setError('Terjadi kesalahan. Silakan coba lagi.')
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#8e94f2] to-[#1e4287] px-4 py-8">
      <motion.div
        className="mb-8 flex flex-col items-center space-y-2 text-white"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="">
          <img
            src={logow}
            alt="Ment'AI Logo"
            className="h-25 w-25 object-contain"
          />
        </div>
      </motion.div>

      <motion.div
        className="w-full max-w-lg space-y-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-center text-3xl font-bold text-white">
          {isLogin ? 'LOGIN' : 'REGISTER'}
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-lg text-white">Email</label>
            <input
              type="email"
              required
              className="w-full p-3 border border-gray-300 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-lg text-white">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full p-3 border border-gray-300 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-lg text-white">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-white text-blue-600 hover:bg-gray-100 p-3 rounded-md transition duration-200">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="flex items-center justify-center space-x-2">
          <div className="w-1/3 h-px bg-gray-300" />
          <span className="text-xs text-white">OR</span>
          <div className="w-1/3 h-px bg-gray-300" />
        </div>

        <button
          type="button"
          className="w-full bg-white text-gray-600 hover:bg-gray-100 p-3 rounded-md flex items-center justify-center transition duration-200"
          onClick={handleGoogleLogin}
        >
          <FaGoogle className="mr-2 h-4 w-4" />
          Continue with Google
        </button>

        <p className="text-center text-sm text-white">
          {isLogin ? 'Tidak ada akun? ' : 'Sudah punya akun? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold underline hover:text-gray-200"
          >
            {isLogin ? 'Register disini' : 'Login disini'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
