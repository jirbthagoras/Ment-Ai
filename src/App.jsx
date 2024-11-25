import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/home';
import AiPage from './pages/aipage';
import Navbar from "@/components/Navbar";
import Footer from '@/components/Footer';
import Login from'./pages/loginregis';
import Admin from './pages/admin';
import ComProfile from './pages/complete-profile';
import Konsultasi from './pages/konsultasi';
import PropTypes from 'prop-types';
import Profile from './pages/profile';
import AdminChat from './pages/AdminChat';

// Protected Route Component
const AdminRoute = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAdmin: false,
    loading: true
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthState({ isAdmin: false, loading: false });
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setAuthState({ 
            isAdmin: userData.isAdmin === true,
            loading: false 
          });
        } else {
          setAuthState({ isAdmin: false, loading: false });
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setAuthState({ isAdmin: false, loading: false });
      }
    });

    return () => unsubscribe();
  }, []);

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#8e94f2] to-[#1e4287]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!authState.isAdmin) {
    toast.error('Anda tidak memiliki akses ke halaman admin!', {
      position: "top-center",
      autoClose: 3000
    });
    return <Navigate to="/" replace />;
  }

  return children;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Login />} />
        <Route path="/complete-profile" element={<ComProfile/>} />
        <Route path="/Konsultasi" element={<Konsultasi/>}/>
        <Route 
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } 
        />
        <Route 
          path="/adminchat"
          element={
            <AdminRoute>
              <AdminChat />
            </AdminRoute>
          } 
        />
        <Route path="/aipage" element={<AiPage />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
