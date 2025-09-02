import { useState } from 'react';
import './BottomNavigation.css';

const BottomNavigation = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'rank', icon: '🏆', label: 'Rank' },
    { id: 'history', icon: '📊', label: 'History' },
    { id: 'profile', icon: '👤', label: 'Profile' }
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => onTabChange(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNavigation;