import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/home';
import AiPage from './pages/aipage';
import ConsultationSection from './sections/ConsultationSection';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aipage" element={<AiPage />} />
      </Routes>
    </Router>
  );
}

export default App;
