import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/home';
import AiPage from './pages/aipage';
import Navbar from "./components/Navbar";
import Footer from './components/Footer';
import Login from'./pages/loginregis';
import Admin from './pages/admin/admin';
import ComProfile from './pages/complete-profile';
import Konsultasi from './pages/konsultasi/konsultasi';
import PropTypes from 'prop-types';
import Profile from './pages/konsultasi/user/profile';
import RuangKonsultasi from './pages/admin/RuangKonsultasi';
import RuangKonsultasiUser from './pages/konsultasi/RuangKonsultasi';
import KomunitasMental from './pages/komunitas/KomunitasMental'
import BagikanCerita from './pages/komunitas/story/BagikanCerita';
import EditStory from './pages/komunitas/story/EditStory';
import StoryDetail from './pages/komunitas/story/StoryDetail';
import TemanDukungan from './pages/komunitas/group/TemanDukungan';
import { AuthProvider } from './contexts/AuthContext';
import PostDetail from './pages/komunitas/group/PostDetail';
import UserChat from './pages/konsultasi/user/UserChat';
import ArtikelPage from './pages/ArtikelPage';



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
    <AuthProvider>
      <Router>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Login />} />
          <Route path="/complete-profile" element={<ComProfile/>} />
          <Route path="/Konsultasi" element={<Konsultasi/>}/>
          <Route path="/ruang-konsultasi-user/:appointmentId" element={<RuangKonsultasiUser />} />
          <Route 
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } 
          />
          <Route 
            path="/ruang-konsultasi/:appointmentId"
            element={
              <AdminRoute>
                <RuangKonsultasi />
              </AdminRoute>
            } 
          />
          <Route path="/aipage" element={<AiPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/KomunitasMental" element={<KomunitasMental />} />
          <Route path="/BagikanCerita" element={<BagikanCerita />} />
          <Route path="/edit-story/:storyId" element={<EditStory />} />
          <Route path="/story/:storyId" element={<StoryDetail />} />
          <Route path="/teman-dukungan" element={<TemanDukungan />} />
          <Route path="/komunitas/post/:postId" element={<PostDetail />} />
          <Route path="/chat/:consultationId" element={<UserChat />} />
          <Route path="/artikel/:id" element={<ArtikelPage />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
