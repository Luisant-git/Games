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
  disclaimerText = "அது உங்களுக்கு நிதி இழப்புகளை ஏற்படுத்தக்கூடும், எனவே கவனமாக விளையாடுங்கள்",
  noticeText = "உங்கள் பணம் 5-நிமிடத்தில் வங்கியில் வந்து சேரும் நண்பா .. நம்ம எஜென்சி 100% உண்மையான எஜென்சி 🏆"
}) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  console.log('CATEGORY',categories);
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

  // Helper: format time to AM/PM
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

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

      {/* Category Tables */}
      <section className="categories-section">
        {loading && (
          <div className="loading-text">Loading categories...</div>
        )}

        {!loading && categories?.length === 0 && (
          <div className="empty-state">No categories found.</div>
        )}

        {!loading && (
          <div className="table-card">
            <table className="show-times-table">
              {/* <thead>
                <tr>
                  <th>Category</th>
                  <th>Show Time</th>
                </tr>
              </thead> */}
              <tbody>
                {categories.map((category) =>
                  category.timing?.map((timing) =>
                    timing.showTimes?.map((showTime) => (
                      <tr
                        key={`${category.id}-${timing.id}-${showTime.id}`}
                        className="show-time-row"
                        onClick={() => {
                          onCategoryChange?.({
                            ...category,
                            timing: [{
                              ...timing,
                              showTimes: [showTime]
                            }]
                          });
                        }}
                      >
                        <td>{category.name}</td>
                        <td>{formatTime(showTime.showTime)}</td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Disclaimer */}
      <section className="info-box info-disclaimer" role="note">
        <h4 className="info-title">Disclaimer !!!</h4>
        <p className="info-text">{disclaimerText}</p>
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
