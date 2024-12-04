'use client'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaGoogle, FaEyeSlash, FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithRedirect, getRedirectResult } from 'firebase/auth';
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
      // Configure Google provider
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      await signInWithRedirect(auth, provider);
    } catch (err) {
      console.error('Google login error:', err);
      setError('Terjadi kesalahan saat login dengan Google.');
    }
  };

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const saved = await saveUserData(result.user.uid, {
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL
          });
          
          if (saved) {
            await checkUserRole(result.user.uid);
          } else {
            setError('Gagal menyimpan data pengguna.');
          }
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        setError('Gagal login dengan Google.');
      }
    };

    handleRedirectResult();
  }, []);

  const saveUserData = async (uid, userData) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      
      // First check if user exists
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // New user
        await setDoc(userDocRef, {
          email: userData.email,
          displayName: userData.displayName || '',
          photoURL: userData.photoURL || '',
          role: 'user',
          isAdmin: false,
          createdAt: new Date(),
          profileCompleted: false,
          lastLogin: new Date(),
          status: 'active'
        });
      } else {
        // Update existing user's last login
        await setDoc(userDocRef, {
          lastLogin: new Date()
        }, { merge: true });
      }
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  }

  const checkUserRole = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid)
      const userDocSnap = await getDoc(userDocRef)
      
      if (!userDocSnap.exists()) {
        navigate('/complete-profile')
        return
      }

      const userData = userDocSnap.data()
      
      if (userData.isAdmin) {
        navigate('/admin')
      } else {
        navigate('/home')
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      setError('Error verifying user status. Please try again.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError("Mohon isi semua field.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Password tidak cocok.");
      return;
    }

    if (!isLogin && password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    try {
      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const saved = await saveUserData(userCredential.user.uid, {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL
        });
        
        if (saved) {
          await checkUserRole(userCredential.user.uid);
        } else {
          setError('Gagal menyimpan data pengguna.');
        }
      } else {
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const saved = await saveUserData(userCredential.user.uid, {
          email: email,
          displayName: '',
          photoURL: ''
        });
        
        if (saved) {
          navigate('/complete-profile');
        } else {
          setError('Gagal menyimpan data pengguna.');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Email sudah terdaftar. Silakan login.');
          setIsLogin(true);
          break;
        case 'auth/invalid-email':
          setError('Format email tidak valid.');
          break;
        case 'auth/weak-password':
          setError('Password terlalu lemah. Minimal 6 karakter.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Email atau password salah.');
          break;
        case 'auth/too-many-requests':
          setError('Terlalu banyak percobaan. Silakan coba lagi nanti.');
          break;
        default:
          setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    }
  };

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
