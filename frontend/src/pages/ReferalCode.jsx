import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAgentProfile } from '../api/auth';
import './ReferalCode.css';

const ReferalCode = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    try {
      const response = await getAgentProfile();
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="referral-code">
      <div className="referral-header">
        <h2>🔗 Referral Code</h2>
        <p>Share your referral code and earn commissions!</p>
      </div>

      <div className="referral-card">
        <div className="code-display">
          <span className="code-label">Your Referral Code</span>
          <div className="code-value">{user.referCode || 'N/A'}</div>
        </div>
        
        <div className="referral-stats">
          <div className="stat">
            <span className="stat-number">{user.playerCount || 0}</span>
            <span className="stat-label">Referred Players</span>
          </div>
          <div className="stat">
            <span className="stat-number">₹{user.totalCommission || 0}</span>
            <span className="stat-label">Total Commission</span>
          </div>
        </div>
      </div>

      {user.referCode && (
        <div className="share-section">
          <h3>Share Your Code</h3>
          <div className="share-buttons">
            <button 
              className="share-btn whatsapp"
              onClick={() => shareReferralCode('whatsapp')}
            >
              <span className="share-icon">💬</span>
              <span>WhatsApp</span>
            </button>
            
            <button 
              className="share-btn telegram"
              onClick={() => shareReferralCode('telegram')}
            >
              <span className="share-icon">✈️</span>
              <span>Telegram</span>
            </button>
            
            <button 
              className="share-btn copy"
              onClick={() => shareReferralCode('copy')}
            >
              <span className="share-icon">📋</span>
              <span>Copy Link</span>
            </button>
            
            <button 
              className="share-btn more"
              onClick={() => shareReferralCode('share')}
            >
              <span className="share-icon">📤</span>
              <span>Share More</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferalCode;