import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAgentProfile } from '../api/auth';
import './Profile.css';

const AgentProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      if (user.id && token) {
        try {
          const response = await getAgentProfile(user.id, token);
          if (response.ok) {
            const data = await response.json();
            setProfileData(data);
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      }
    };
    fetchProfile();
  }, [user.id, token]);
  
  const menuItems = [
    { id: 1, icon: '💰', label: 'Wallet', count: `₹${profileData?.wallet?.balance || 0}` },
    { id: 3, icon: '👥', label: 'My Players', count: profileData?.playerCount || 0 },
    { id: 5, icon: '📈', label: 'Commission', count: `₹${profileData?.totalCommission || 0}` },
    { id: 8, icon: '🚪', label: 'Logout', count: null }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    window.location.reload();
  };

  const copyReferralCode = () => {
    if (profileData?.referCode) {
      navigator.clipboard.writeText(profileData.referCode);
      toast.success('Referral code copied!');
    }
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-avatar">🏢</div>
        <div className="profile-info">
          <h2>{profileData?.name || user.name || 'Agent'}</h2>
          <p>{profileData?.email || user.email}</p>
          <span className="member-badge">Gaming Agent</span>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-number">₹{profileData?.wallet?.balance || 0}</span>
          <span className="stat-label">Wallet</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{profileData?.playerCount || 0}</span>
          <span className="stat-label">Players</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">₹{profileData?.totalCommission || 0}</span>
          <span className="stat-label">Commission</span>
        </div>
      </div>

      <div className="referral-section">
        <div className="referral-header">
          <span className="referral-icon">🔗</span>
          <span className="referral-title">Referral Code</span>
        </div>
        <div className="referral-code-container">
          <span className="referral-code">{profileData?.referCode || 'Loading...'}</span>
          <button className="copy-button" onClick={copyReferralCode}>
            📋
          </button>
        </div>
      </div>

      <div className="profile-menu">
        {menuItems.map(item => (
          <div 
            key={item.id} 
            className="menu-item"
            onClick={item.label === 'Logout' ? handleLogout : undefined}
            style={item.label === 'Logout' ? { cursor: 'pointer' } : {}}
          >
            <div className="menu-content">
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
              {item.count && <span className="menu-count">{item.count}</span>}
            </div>
            <span className="menu-arrow">→</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentProfile;