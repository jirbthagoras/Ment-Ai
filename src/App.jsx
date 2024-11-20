// import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import AiPage from './pages/aipage';
// import ConsultationSection from './sections/ConsultationSection';
import Navbar from "@/components/Navbar";
import Footer from '@/components/Footer';

function App() {
  return (
    <>
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aipage" element={<AiPage />} />
      </Routes>
      <Footer />
    </Router>

    </>
  );
}

export default App;
