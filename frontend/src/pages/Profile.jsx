import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlayerWallet } from '../api/wallet';
import './Profile.css';
import { getPlayerProfile } from '../api/auth';

const Profile = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState({});

  useEffect(() => {
    fetchBalance();
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    try {
      const response = await getPlayerProfile();
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching playerProfile:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await getPlayerWallet();
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    window.location.reload();
  };
  
  const menuItems = [
    { id: 1, icon: '💰', label: 'Deposit', action: () => navigate('/deposit') },
    { id: 2, icon: '🏦', label: 'Withdraw', action: () => navigate('/withdraw') },
    { id: 8, icon: '🚪', label: 'Logout', action: handleLogout }
  ];

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-avatar">🙍🏻</div>
        <div className="profile-info">
          <h2>{user.username || 'Player'}</h2>
          <span className="member-badge">Premium Member</span>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-number">₹{balance}</span>
          <span className="stat-label">Wallet Balance</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{user?.gameHistory?.length || '0'}</span>
          <span className="stat-label">Games Played</span>
        </div>
        
        {/* <div className="stat-item">
          <span className="stat-number">{user?.gameHistory?.filter(game => game.isWon).length || '0'}</span>
          <span className="stat-label">Games Won</span>
        </div> */}
      </div>

      <div className="profile-menu">
        {menuItems.map(item => (
          <div 
            key={item.id} 
            className="menu-item"
            onClick={item.action}
            style={{ cursor: 'pointer' }}
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

export default Profile;