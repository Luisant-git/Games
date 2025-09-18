import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlayerProfile, getAgentProfile } from '../api/auth';
import ShareReferral from '../components/ShareReferral';
import './ReferralCode.css';

const ReferralCode = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    try {
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

  return (
    <div className="referral-page">
      <div className="referral-header">
        <h1>My Referral Code</h1>
      </div>

      <div className="referral-card">
        <div className="referral-code-section">
          <h2>Your Referral Code</h2>
          <div className="code-display">
            {user.referCode}
          </div>
          <button 
            className="share-btn-main"
            onClick={() => setShowShareModal(true)}
          >
            📤 Share Code
          </button>
        </div>

        <div className="referral-stats">
          <div className="stat-card">
            <div className="stat-icon">🎁</div>
            <div className="stat-info">
              <span className="stat-number">
                ₹{userType === 'agent' ? (user.totalCommission || 0) : (user.wallet?.bonusBalance || 0)}
              </span>
              <span className="stat-label">
                {userType === 'agent' ? 'Total Commission' : 'Referral Bonus'}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <span className="stat-number">
                {userType === 'agent' ? (user.playerCount || 0) : (user.referredPlayersCount || 0)}
              </span>
              <span className="stat-label">
                {userType === 'agent' ? 'My Players' : 'Referred Players'}
              </span>
            </div>
          </div>
        </div>

        <div className="referral-info">
          <h3>How it works:</h3>
          <ul>
            <li>Share your referral code with friends</li>
            <li>When they register using your code, you earn rewards</li>
            <li>{userType === 'agent' ? 'Earn commission on their gameplay' : 'Get ₹100 bonus instantly'}</li>
            <li>Track your earnings and referrals here</li>
          </ul>
        </div>
      </div>

      {showShareModal && (
        <ShareReferral 
          referCode={user.referCode} 
          onClose={() => setShowShareModal(false)} 
        />
      )}
    </div>
  );
};

export default ReferralCode;