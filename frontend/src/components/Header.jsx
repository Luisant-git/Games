import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import { getPlayerWallet } from "../api/wallet";

const Header = ({ selectedCategory }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const showBackButton = location.pathname !== '/' || !!selectedCategory;
  const [balance, setBalance] = useState(0);
  console.log(balance, '<--- balance');

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await getPlayerWallet();
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          {showBackButton ? (
            <button className="back-btn" onClick={() => selectedCategory ? window.location.reload() : navigate(-1)}>
              <span style={{fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer'}}>←</span>
            </button>
          ) : <span className="logo-text" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>GameHub</span>}
        </div>
        <div className="header-actions">
          {/* <button className="notification-btn">💵{balance}</button> */}
          <button className="menu-btn">🔔</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
