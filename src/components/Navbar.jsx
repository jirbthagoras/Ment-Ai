import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scaleX, setScaleX] = useState(0);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.isAdmin === true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    setScrolled(scrollTop > 50);
    setScaleX(scrollTop / (document.body.scrollHeight - window.innerHeight));
  };

  const navItems = [
    { label: 'Beranda', path: '/' },
    { label: 'Komunitas', path: '/komunitasmental' },
    { label: 'Layanan Konsultasi', path: '/Konsultasi' },
    { label: 'DrMen', path: '/aipage' },
  ];

  // Add admin link if user is admin
  if (isAdmin && !loading) {
    navItems.push({ label: 'Admin', path: '/admin' });
  }

  // Add login/profile link
  if (user) {
    navItems.push({ label: 'Profile', path: '/profile' });
  } else {
    navItems.push({ label: 'Login', path: '/Login' });
  }

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-pink-500 z-50 origin-left"
        style={{ scaleX }}
      />

      <motion.nav
        className={`fixed w-full z-40 transition-all duration-300 ${
          scrolled ? 'bg-white/10 backdrop-blur-md shadow-lg' : ''
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="container mx-auto flex justify-between items-center py-4 px-4">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Ment'Ai Logo" className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="text-blue-900 font-medium hover:text-blue-700 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-blue-900 focus:outline-none"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden fixed inset-0 bg-white z-30 pt-20"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex flex-col items-center space-y-6">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="text-blue-900 font-medium text-xl"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
