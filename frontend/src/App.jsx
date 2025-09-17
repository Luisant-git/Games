import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import Home from './pages/Home';
import Support from './pages/Support';
import Game from './pages/Game';
import History from './pages/History';
import Profile from './pages/Profile';

import AgentHistory from './pages/AgentHistory';
import Login from './pages/Login';
import Register from './pages/Register';
import ReferalCode from './pages/ReferalCode';

import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import ChangePassword from './pages/ChangePassword';
import Account from './pages/Account';
import Result from './pages/Result';

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userType, setUserType] = useState(localStorage.getItem('userType') || 'player');
  const [isInGame, setIsInGame] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const isAgentMode = new URLSearchParams(location.search).get('agent') !== null;

  useEffect(() => {
    if (location.pathname !== '/game') {
      setIsInGame(false);
    }
  }, [location.pathname]);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setUserType(localStorage.getItem('userType') || 'player');
    navigate('/');
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
    setUserType(localStorage.getItem('userType') || 'player');
    navigate('/');
  };

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/support') return 'support';
    if (path === '/game') return 'game';
    if (path === '/history') return 'history';
    if (path === '/profile') return 'profile';
    if (path === '/results') return 'support';
    return 'home';
  };

  const showHeader = isLoggedIn && !['/login', '/register', '/agent-history'].includes(location.pathname);
  const showBottomNav = isLoggedIn && !isInGame && !['/login', '/register', '/agent-history'].includes(location.pathname);

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
          <Route path="/" element={
            isLoggedIn ? (
              <Home onGameStateChange={setIsInGame} onCategoryChange={setSelectedCategory} selectedCategory={selectedCategory} />
            ) : (
              <Navigate to="/login" />
            )
          } />
          <Route path="/support" element={isLoggedIn ? <Support /> : <Navigate to="/login" />} />
          <Route path="/game" element={isLoggedIn ? <Game /> : <Navigate to="/login" />} />
          <Route path="/history" element={isLoggedIn ? <History /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />

          <Route path="/agent-history" element={isLoggedIn && userType === 'agent' ? <AgentHistory /> : <Navigate to="/login" />} />
          <Route path="/referral-code" element={isLoggedIn && userType === 'agent' ? <ReferalCode /> : <Navigate to="/login" />} />
          <Route path="/deposit" element={isLoggedIn ? <Deposit /> : <Navigate to="/login" />} />
          <Route path="/withdraw" element={isLoggedIn ? <Withdraw /> : <Navigate to="/login" />} />
          <Route path="/change-password" element={isLoggedIn ? <ChangePassword /> : <Navigate to="/login" />} />
          <Route path="/account" element={isLoggedIn ? <Account /> : <Navigate to="/login" />} />
          <Route path="/results" element={isLoggedIn ? <Result /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} />} />
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
