import { useState, useEffect } from 'react';
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

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentView, setCurrentView] = useState(() => {
    if (!!localStorage.getItem('token')) return 'main';
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('agent') ? 'agentLogin' : 'login';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userType, setUserType] = useState(localStorage.getItem('userType') || 'player');
  const [showAgentOptions, setShowAgentOptions] = useState(false);
  const [isInGame, setIsInGame] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setShowAgentOptions(urlParams.has('agent'));
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setUserType(localStorage.getItem('userType') || 'player');
    setCurrentView('main');
    if (localStorage.getItem('userType') === 'agent') {
      setActiveTab('profile');
    } else {
      setActiveTab('home');
    }
  };

  const handleRegister = () => {
    setIsLoggedIn(true);
    setUserType(localStorage.getItem('userType') || 'player');
    setCurrentView('main');
    if (localStorage.getItem('userType') === 'agent') {
      setActiveTab('profile');
    } else {
      setActiveTab('home');
    }
  };

  const renderContent = () => {
    if (currentView === 'login') {
      return (
        <Login 
          onLogin={handleLogin}
          onSwitchToRegister={() => setCurrentView('register')}
          onSwitchToAgent={showAgentOptions ? () => setCurrentView('agentLogin') : null}
          showAgentOption={showAgentOptions}
        />
      );
    }
    
    if (currentView === 'register') {
      return (
        <Register 
          onRegister={handleRegister}
          onSwitchToLogin={() => setCurrentView('login')}
          onSwitchToAgent={showAgentOptions ? () => setCurrentView('agentRegister') : null}
          showAgentOption={showAgentOptions}
        />
      );
    }
    
    if (currentView === 'agentLogin') {
      return (
        <AgentLogin 
          onLogin={handleLogin}
          onSwitchToRegister={() => setCurrentView('agentRegister')}
          onSwitchToPlayer={showAgentOptions ? null : () => setCurrentView('login')}
        />
      );
    }
    
    if (currentView === 'agentRegister') {
      return (
        <AgentRegister 
          onRegister={handleRegister}
          onSwitchToLogin={() => setCurrentView('agentLogin')}
          onSwitchToPlayer={showAgentOptions ? null : () => setCurrentView('register')}
        />
      );
    }
    

    
    // Agent users only see profile
    if (userType === 'agent') {
      return <AgentProfile />;
    }

    // Player navigation
    switch (activeTab) {
      case 'home':
        return <Home onGameStateChange={setIsInGame} onCategoryChange={setSelectedCategory} selectedCategory={selectedCategory} onNavigateToHistory={() => setActiveTab('history')} />;
      case 'rank':
        return <Rank />;
      case 'game':
        return <Game />;
      case 'history':
        return <History />;
      case 'profile':
        return <Profile onNavigate={setActiveTab} />;
      case 'deposit':
        return <Deposit />;
      case 'withdraw':
        return <Withdraw />;
      default:
        return <Home onGameStateChange={setIsInGame} />;
    }
  };

  return (
    <div className="app">
      <Toaster position="top-center" />
      {(currentView === 'main' && isLoggedIn && userType !== 'agent') && <Header showBackButton={!!selectedCategory || (activeTab !== 'home')} onBackClick={() => { setSelectedCategory(null); setActiveTab('home'); }} onNavigateToHome={() => { setActiveTab('home'); setSelectedCategory(null); }} />}
      <main className="main-content">
        {renderContent()}
      </main>
      {(currentView === 'main' && isLoggedIn && userType !== 'agent' && !isInGame) && <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}

export default App
