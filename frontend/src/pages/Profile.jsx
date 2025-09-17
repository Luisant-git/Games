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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    window.location.reload();
  };
  
  const userType = localStorage.getItem('userType');
  
  const shareReferralCode = (platform) => {
    if (!user.referCode) return;
    
    const appUrl = window.location.origin;
    const referralUrl = `${appUrl}/register?ref=${user.referCode}`;
    const message = `🎮 Join our Gaming Platform!\n\n🔥 Use my referral code: ${user.referCode}\n🔗 Register here: ${referralUrl}\n\n💰 Start playing and winning today!`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(message);
        toast.success('Referral message copied to clipboard!');
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: 'Gaming Platform Referral',
            text: message,
            url: referralUrl
          });
        } else {
          navigator.clipboard.writeText(message);
          toast.success('Referral message copied to clipboard!');
        }
    }
  };
  
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
        { id: 6, icon: '📈', label: 'Commission', count: `₹${user.totalCommission || 0}` },
        { id: 7, icon: '👥', label: 'My Players', count: user.playerCount || 0 }
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
        {/* <div className="stat-item">
          <span className="stat-number">{user?.gameHistory?.length || '0'}</span>
          <span className="stat-label">Games Played</span>
        </div> */}
        
        {/* <div className="stat-item">
          <span className="stat-number">{user?.gameHistory?.filter(game => game.isWon).length || '0'}</span>
          <span className="stat-label">Games Won</span>
        </div> */}
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
    </div>
  );
};

export default Profile;