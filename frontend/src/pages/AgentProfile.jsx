import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getAgentProfile, getCommissionHistory } from "../api/auth";
import "./Profile.css";

const AgentProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [commissionHistory, setCommissionHistory] = useState([]);
  const [showCommissions, setShowCommissions] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const response = await getAgentProfile();
          if (response.ok) {
            const data = await response.json();
            setProfileData(data);
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        }
      }
    };
    fetchProfile();
  }, [token]);

  const fetchCommissionHistory = async () => {
    try {
      const response = await getCommissionHistory();
      if (response.ok) {
        const data = await response.json();
        setCommissionHistory(data.data || []);
        setShowCommissions(true);
      }
    } catch (error) {
      console.error("Failed to fetch commission history:", error);
      toast.error("Failed to load commission history");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    window.location.reload();
  };

  const menuItems = [
    {
      id: 1,
      icon: "💰",
      label: "Wallet",
      count: `₹${profileData?.wallet?.balance || 0}`,
    },
    {
      id: 2,
      icon: "🎮",
      label: "Play Games",
      count: null,
      action: () => navigate("/"),
    },
    {
      id: 3,
      icon: "📊",
      label: "Game History",
      count: null,
      action: () => navigate("/agent-history"),
    },
    {
      id: 4,
      icon: "👥",
      label: "My Players",
      count: profileData?.playerCount || 0,
    },
    {
      id: 5,
      icon: "📈",
      label: "Commission",
      count: `₹${profileData?.totalCommission || 0}`,
      action: fetchCommissionHistory,
    },
    { id: 8, icon: "🚪", label: "Logout", count: null, action: handleLogout },
  ];

  const copyReferralCode = () => {
    if (profileData?.referCode) {
      navigator.clipboard.writeText(profileData.referCode);
      toast.success("Referral code copied!");
    }
  };

  const shareReferralCode = (platform) => {
    if (!profileData?.referCode) return;

    const appUrl = window.location.origin;
    const referralUrl = `${appUrl}/register?ref=${profileData.referCode}`;
    const message = `\n->Use my referral code: ${profileData.referCode}\n-> Register here: ${referralUrl}\n`;

    switch (platform) {
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(message)}`,
          "_blank"
        );
        break;
      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(
            referralUrl
          )}&text=${encodeURIComponent(message)}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(message);
        toast.success("Referral message copied to clipboard!");
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: "Gaming Platform Referral",
            text: message,
            url: referralUrl,
          });
        } else {
          navigator.clipboard.writeText(message);
          toast.success("Referral message copied to clipboard!");
        }
    }
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="profile-avatar">🏢</div>
        <div className="profile-info">
          <h2>{profileData?.name || user.name || "Agent"}</h2>
          <p>{profileData?.email || user.email}</p>
          <span className="member-badge">Gaming Agent</span>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-number">
            ₹{profileData?.wallet?.balance || 0}
          </span>
          <span className="stat-label">Wallet</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{profileData?.playerCount || 0}</span>
          <span className="stat-label">Players</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            ₹{profileData?.totalCommission || 0}
          </span>
          <span className="stat-label">Commission</span>
        </div>
      </div>

      <div className="referral-section">
        <div className="referral-header">
          <span className="referral-icon">🔗</span>
          <span className="referral-title">Referral Code</span>
        </div>
        <div className="referral-code-container">
          <span className="referral-code">
            {profileData?.referCode || "Loading..."}
          </span>
          <button className="copy-button" onClick={copyReferralCode}>
            📋
          </button>
        </div>

        {profileData?.referCode && (
          <div className="share-buttons">
            <button
              className="share-btn whatsapp"
              onClick={() => shareReferralCode("whatsapp")}
              title="Share on WhatsApp"
            >
              <span style={{ fontSize: "16px" }}>💬</span>
              WhatsApp
            </button>
            <button
              className="share-btn telegram"
              onClick={() => shareReferralCode("telegram")}
              title="Share on Telegram"
            >
              <span style={{ fontSize: "16px" }}>✈️</span>
              Telegram
            </button>
            <button
              className="share-btn copy"
              onClick={() => shareReferralCode("copy")}
              title="Copy message to clipboard"
            >
              <span style={{ fontSize: "16px" }}>📋</span>
              Copy Link
            </button>
            <button
              className="share-btn more"
              onClick={() => shareReferralCode("share")}
              title="More sharing options"
            >
              <span style={{ fontSize: "16px" }}>📤</span>
              Share More
            </button>
          </div>
        )}
      </div>

      <div className="profile-menu">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="menu-item"
            onClick={item.action}
            style={{ cursor: "pointer" }}
          >
            <div className="menu-content">
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
              {item.count !== null && (
                <span className="menu-count">{item.count}</span>
              )}
            </div>
            <span className="menu-arrow">→</span>
          </div>
        ))}
      </div>

      {showCommissions && (
        <div className="commission-modal">
          <div className="commission-content">
            <div className="commission-header">
              <h3>Commission History</h3>
              <button onClick={() => setShowCommissions(false)}>✕</button>
            </div>
            <div className="commission-list">
              {commissionHistory.length > 0 ? (
                commissionHistory.map((commission, index) => (
                  <div key={index} className="commission-item">
                    <div className="commission-info">
                      <span className="commission-type">
                        {commission.commissionType}
                      </span>
                      <span className="commission-date">
                        {new Date(commission.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="commission-amount">
                      +₹{commission.amount}
                    </span>
                  </div>
                ))
              ) : (
                <p>No commission history found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentProfile;
