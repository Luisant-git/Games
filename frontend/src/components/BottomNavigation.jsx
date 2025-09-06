import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BottomNavigation.css';

const BottomNavigation = ({ activeTab }) => {
  const navigate = useNavigate();
  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home', path: '/' },
    { id: 'rank', icon: '🏆', label: 'Rank', path: '/rank' },
    { id: 'history', icon: '📊', label: 'History', path: '/history' },
    { id: 'profile', icon: '👤', label: 'Profile', path: '/profile' }
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNavigation;