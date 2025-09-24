import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getPlayerWallet } from '../api/wallet';
import './Profile.css';
import { getPlayerProfile, getAgentProfile, getAgentWallet } from '../api/auth';

const Profile = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    fetchBalance();
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    try {
      const userType = localStorage.getItem('userType');
      const response = userType === 'agent' ? 
        await getAgentProfile() : 
        await getPlayerProfile();
      
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const userType = localStorage.getItem('userType');
      const response = userType === 'agent' ? 
        await getAgentWallet() : 
        await getPlayerWallet();
      
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };
  
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    window.location.reload();
  };
  
  const userType = localStorage.getItem('userType');
  

  
  const getMenuItems = () => {
    const baseItems = [
      { id: 1, icon: '💰', label: 'Deposit', action: () => navigate('/deposit') },
      { id: 2, icon: '🏦', label: 'Withdraw', action: () => navigate('/withdraw') },
      { id: 3, icon: '📝', label: 'Account Information', action: () => navigate('/account') },
      { id: 4, icon: '🔒', label: 'Change Password', action: () => navigate('/change-password') },
    ];
    
    if (userType === 'agent') {
      baseItems.push(
        { id: 5, icon: '🔗', label: 'Referral Code', count: user.referCode, action: () => navigate('/referral-code') },
        // { id: 6, icon: '📈', label: 'Commission', count: `₹${user.totalCommission || 0}` },
        { id: 7, icon: '👥', label: 'My Players', count: user.playerCount || 0, action: () => navigate('/my-players') }
      );
    } else {
      // Add referral features for players too
      baseItems.push(
        { id: 5, icon: '🔗', label: 'My Referral Code', count: user.referCode, action: () => navigate('/referral-code') },
        // { id: 6, icon: '🎁', label: 'Referral Bonus', count: `₹${user.wallet?.bonusBalance || 0}` },
        { id: 7, icon: '👥', label: 'Referred Players', count: user.referredPlayersCount || 0 }
      );
    }
    
    baseItems.push({ id: 8, icon: '🚪', label: 'Logout', action: handleLogout });
    return baseItems;
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-avatar">🙍🏻</div>
        <div className="profile-info">
          <h2>{user.username || (userType === 'agent' ? 'Agent' : 'Player')}</h2>
          <span className="member-badge">{userType === 'agent' ? 'Gaming Agent' : 'Premium Member'}</span>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-number">₹{balance}</span>
          <span className="stat-label">Wallet Balance</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {userType === 'agent' ? `📈₹${(user.totalCommission || 0).toFixed(2)}` : `🎁₹${(user.wallet?.bonusBalance || 0).toFixed(2)}`}
          </span>
          <span className="stat-label">
            {userType === 'agent' ? 'Commission' : 'Referral Bonus'}
          </span>
        </div>
      </div>

      <div className="profile-menu">
        {getMenuItems().map(item => (
          <div key={item.id}>
            <div 
              className="menu-item"
              onClick={item.action}
              style={{ cursor: item.action ? 'pointer' : 'default' }}
            >
              <div className="menu-content">
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
                {item.count && <span className="menu-count">{item.count}</span>}
              </div>
              <span className="menu-arrow">→</span>
            </div>
          </div>
        ))}
      </div>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button onClick={() => setShowLogoutModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={confirmLogout} className="confirm-btn">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;