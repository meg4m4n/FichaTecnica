import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import CreateTechnicalSheet from './pages/CreateTechnicalSheet';
import CreateClient from './pages/CreateClient';
import CreatePieceType from './pages/CreatePieceType';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1920px]">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create-sheet" element={<CreateTechnicalSheet />} />
            <Route path="/create-client" element={<CreateClient />} />
            <Route path="/create-piece-type" element={<CreatePieceType />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App