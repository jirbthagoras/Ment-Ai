import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import logo from '../assets/logo.png';
import { Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scaleX, setScaleX] = useState(0);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

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

  if (isAdmin && !loading) {
    navItems.push({ label: 'Admin', path: '/admin' });
  }

  if (user) {
    navItems.push({ label: 'Profile', path: '/profile' });
  } else {
    navItems.push({ label: 'Login', path: '/Login' });
  }

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 z-50 origin-left"
        style={{ scaleX }}
      />

      <motion.nav
        className={`fixed w-full z-40 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/70 backdrop-blur-md shadow-sm' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 group"
              onClick={() => setIsOpen(false)}
            >
              <motion.img 
                src={logo} 
                alt="Ment'Ai Logo" 
                className="h-8 w-auto sm:h-10 lg:h-12"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`px-3 py-2 text-sm xl:text-base rounded-lg font-medium relative group overflow-hidden
                    ${isActivePath(item.path)
                      ? 'text-[#2A386A] bg-pink-50/50'
                      : 'text-[#2A386A] hover:text-[#2A386A]/80'
                    }
                    transition-all duration-300 ease-in-out`}
                >
                  <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2A386A]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isActivePath(item.path) ? 1 : 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-pink-50 rounded-lg"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ zIndex: -1 }}
                  />
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-pink-50 transition-colors"
              aria-label="Toggle Menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex flex-col justify-center items-center">
                <motion.span
                  className="w-full h-0.5 bg-[#2A386A] rounded-full mb-1.5 transform origin-center"
                  animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-full h-0.5 bg-[#2A386A] rounded-full mb-1.5"
                  animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.span
                  className="w-full h-0.5 bg-[#2A386A] rounded-full transform origin-center"
                  animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white/90 backdrop-blur-lg border-t shadow-sm"
            >
              <motion.div 
                className="max-w-7xl mx-auto px-4 py-3 sm:py-4"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col space-y-1 sm:space-y-2">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium block text-sm sm:text-base
                          ${isActivePath(item.path)
                            ? 'bg-pink-50 text-[#2A386A]'
                            : 'text-[#2A386A]/90 hover:bg-pink-50 hover:text-[#2A386A]'
                          }
                          transition-all duration-300`}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
