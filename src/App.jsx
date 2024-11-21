// import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import AiPage from './pages/aipage';
// import ConsultationSection from './sections/ConsultationSection';
import Navbar from "@/components/Navbar";
import Footer from '@/components/Footer';
import Login from'./pages/loginregis';
import Admin from './pages/admin'
import ComProfile from './pages/complete-profile'

function App() {
  return (
    <>
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Login />} />
        <Route path="/complete-profile" element={<ComProfile/>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/aipage" element={<AiPage />} />
      </Routes>
      <Footer />
    </Router>

    </>
  );
}

export default App;
