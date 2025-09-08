import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import Home from './pages/Home';
import Rank from './pages/Rank';
import Game from './pages/Game';
import History from './pages/History';
import Profile from './pages/Profile';
import AgentProfile from './pages/AgentProfile';
import Login from './pages/Login';
import Register from './pages/Register';
import AgentLogin from './pages/AgentLogin';
import AgentRegister from './pages/AgentRegister';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userType, setUserType] = useState(localStorage.getItem('userType') || 'player');
  const [isInGame, setIsInGame] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const isAgentMode = new URLSearchParams(location.search).get('agent') !== null;

  const handleLogin = () => {
    setIsLoggedIn(true);
    setUserType(localStorage.getItem('userType') || 'player');
    if (localStorage.getItem('userType') === 'agent') {
      navigate('/agent-profile');
    } else {
      navigate('/');
    }
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
    setUserType(localStorage.getItem('userType') || 'player');
    if (localStorage.getItem('userType') === 'agent') {
      navigate('/agent-profile');
    } else {
      navigate('/');
    }
  };

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/rank') return 'rank';
    if (path === '/game') return 'game';
    if (path === '/history') return 'history';
    if (path === '/profile') return 'profile';
    return 'home';
  };

  const showHeader = isLoggedIn && userType !== 'agent' && !['/login', '/register', '/agent-login', '/agent-register'].includes(location.pathname);
  const showBottomNav = isLoggedIn && userType !== 'agent' && !isInGame && !['/login', '/register', '/agent-login', '/agent-register', '/deposit', '/withdraw'].includes(location.pathname);

  return (
    <div className="app">
      <Toaster position="top-center" />
      {showHeader && (
        <Header selectedCategory={selectedCategory} />
      )}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route path="/agent-login" element={<AgentLogin onLogin={handleLogin} />} />
          <Route path="/agent-register" element={<AgentRegister onRegister={handleRegister} />} />
          <Route path="/" element={
            isLoggedIn ? (
              <Home onGameStateChange={setIsInGame} onCategoryChange={setSelectedCategory} selectedCategory={selectedCategory} />
            ) : (
              isAgentMode ? <AgentLogin onLogin={handleLogin} /> : <Navigate to="/login" />
            )
          } />
          <Route path="/rank" element={isLoggedIn ? <Rank /> : <Navigate to="/login" />} />
          <Route path="/game" element={isLoggedIn ? <Game /> : <Navigate to="/login" />} />
          <Route path="/history" element={isLoggedIn ? <History /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/agent-profile" element={isLoggedIn && userType === 'agent' ? <AgentProfile /> : <Navigate to="/login" />} />
          <Route path="/deposit" element={isLoggedIn ? <Deposit /> : <Navigate to="/login" />} />
          <Route path="/withdraw" element={isLoggedIn ? <Withdraw /> : <Navigate to="/login" />} />
        </Routes>
      </main>
      {showBottomNav && <BottomNavigation activeTab={getActiveTab()} />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App
