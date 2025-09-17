import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../api/category";
import { getPlayerWallet } from "../api/wallet";
import { getAgentWallet } from "../api/auth";
import Game from "./Game";
import "./Home.css";

const Home = ({
  onGameStateChange,
  onCategoryChange,
  selectedCategory,
  disclaimerText = "இது உங்கள் நிதி அபாயத்தை இலக்கவாம் பொருப்புடன் விளையாடவும்",
  noticeText = "உங்கள் பணம் 5-நிமிடத்தில் வங்கியில் வந்து சேரும் நண்பா .. நம்ம எஜென்சி 100% உண்மையான எஜென்சி 🏆"
}) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [games, setGames] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (onGameStateChange) onGameStateChange(!!selectedCategory);
  }, [selectedCategory, onGameStateChange]);

  useEffect(() => {
    (async () => {
      try {
        const userType = localStorage.getItem('userType');
        const [categoryData, walletResponse] = await Promise.all([
          getCategories(),
          userType === 'agent' ? getAgentWallet() : getPlayerWallet()
        ]);
        
        setCategories(categoryData?.categories || []);
        setGames(categoryData?.games || []);
        
        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          setWalletBalance(walletData.balance || 0);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Helper: format INR nicely
  const formatINR = (amt) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amt || 0);

  if (selectedCategory) {
    return (
      <div className="home">
        <Game
          category={selectedCategory}
          games={games}
        />
      </div>
    );
  }

  return (
    <div className="home">
      {/* Wallet Card */}
      <section className="wallet-card" aria-label="Wallet Balance">
        <div className="wallet-balance">
          <span className="rupee">₹</span>
          <span className="amount">{(walletBalance ?? 0).toFixed(2)}</span>
        </div>
        <div className="wallet-caption">wallet balance</div>
        <div className="wallet-actions">
          <button className="btn btn-warning" onClick={() => navigate('/withdraw')}>WITHDRAW</button>
          <button className="btn btn-success" onClick={() => navigate('/deposit')}>DEPOSIT</button>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="info-box info-disclaimer" role="note">
        <h4 className="info-title">Disclaimer !!!</h4>
        <p className="info-text">{disclaimerText}</p>
      </section>

      {/* Categories from API (your banner images) */}
      <section className="banners">
        {loading && (
          <>
            <div className="banner-skeleton" />
            <div className="banner-skeleton" />
          </>
        )}

        {!loading && categories?.length === 0 && (
          <div className="empty-state">No categories found.</div>
        )}

        {!loading &&
          categories.map((category) => (
            <div className="banner" key={category.id}>
              <img
                className="banner-image"
                src={category.image}
                alt={category.name}
                loading="lazy"
                onClick={() => onCategoryChange?.(category)}
              />
            </div>
          ))}
      </section>

      {/* Notice */}
      {/* <section className="info-box info-notice" role="status">
        <h4 className="info-title">⚠️ Notice</h4>
        <p className="info-text">{noticeText}</p>
      </section> */}

      {/* Bottom padding for fixed tab bars */}
      <div className="tabbar-spacer" />
    </div>
  );
};

export default Home;
