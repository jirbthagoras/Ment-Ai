import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebase'; // Import auth
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scaleX, setScaleX] = useState(0);
  const [userRole, setUserRole] = useState(null); // State to hold user role

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    setScrolled(scrollTop > 50);
    setScaleX(scrollTop / (document.body.scrollHeight - window.innerHeight));
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const db = getFirestore();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.isAdmin ? 'admin' : 'user'); // Set user role based on Firestore data
        }
      } else {
        setUserRole(null); // Reset user role if not logged in
      }
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe(); // Cleanup subscription on unmount
    };
  }, []);

  const menuVariants = {
    hidden: {
      opacity: 0,
      x: '100%'
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      x: '100%',
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-pink-500 z-50 origin-left"
        style={{ scaleX }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX }}
        transition={{ duration: 0.5 }}
      />

      {/* Enhanced Responsive Navigation */}
      <motion.nav
        className={`fixed w-full z-40 transition-all duration-300 ${scrolled ? 'bg-white/10 backdrop-blur-md shadow-lg' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="container mx-auto flex justify-between items-center py-4 px-4">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src={logo}
              alt="Ment'Ai Logo"
              className="h-12 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            <a href="/" className="text-blue-900 font-medium hover:text-blue-700">Beranda</a>
            <a href="#" className="text-blue-900 font-medium hover:text-blue-700">Komunitas</a>
            <a href="/Konsultasi" className="text-blue-900 font-medium hover:text-blue-700">Layanan Konsultasi</a>
            <a href="/aipage" className="text-blue-900 font-medium hover:text-blue-700">DrMen</a>
            {userRole === 'admin' ? (
              <a href="/admin" className="text-blue-900 font-medium hover:text-blue-700">Admin</a>
            ) : userRole === 'user' ? (
              <a href="/profile" className="text-blue-900 font-medium hover:text-blue-700">Profile</a>
            ) : (
              <a href="/Login" className="text-blue-900 font-medium hover:text-blue-700">Login</a>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-blue-900 focus:outline-none"
            >
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden fixed inset-0 bg-white z-30 pt-20"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex flex-col items-center space-y-6">
                <a
                  href="#"
                  className="text-blue-900 font-medium text-xl"
                  onClick={closeMenu}
                >
                  Home
                </a>
                <a
                  href="#"
                  className="text-blue-900 font-medium text-xl"
                  onClick={closeMenu}
                >
                  About
                </a>
                <a
                  href="#"
                  className="text-blue-900 font-medium text-xl"
                  onClick={closeMenu}
                >
                  Layanan Konsultasi
                </a>
                <a
                  href="#"
                  className="text-blue-900 font-medium text-xl"
                  onClick={closeMenu}
                >
                  DrMen
                </a>
                {userRole === 'admin' ? (
                  <a
                    href="/admin"
                    className="text-blue-900 font-medium text-xl"
                    onClick={closeMenu}
                  >
                    Admin
                  </a>
                ) : userRole === 'user' ? (
                  <a
                    href="/profile"
                    className="text-blue-900 font-medium text-xl"
                    onClick={closeMenu}
                  >
                    Profile
                  </a>
                ) : (
                  <a
                    href="/Login"
                    className="text-blue-900 font-medium text-xl"
                    onClick={closeMenu}
                  >
                    Login
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
