import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAgentGameHistory } from '../api/games';
import './History.css';

const AgentHistory = () => {
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        const response = await getAgentGameHistory();
        if (response.ok) {
          const data = await response.json();
          setGameHistory(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch game history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameHistory();
  }, []);

  if (loading) {
    return <div className="loading">Loading game history...</div>;
  }

  return (
    <div className="history">
      <div className="history-header">
        <button className="back-button" onClick={() => navigate('/agent-profile')}>
          ← Back
        </button>
        <h2>My Game History</h2>
      </div>

      <div className="history-list">
        {gameHistory.length > 0 ? (
          gameHistory.map((game) => (
            <div key={game.id} className="history-item">
              <div className="history-main">
                <div className="history-info">
                  <span className="history-date">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </span>
                  <span className="history-time">
                    {new Date(game.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="history-amounts">
                  <span className="bet-amount">Bet: ₹{game.totalBetAmount}</span>
                  <span className={`win-amount ${game.isWon ? 'won' : 'lost'}`}>
                    {game.isWon ? `Won: ₹${game.totalWinAmount}` : 'Lost'}
                  </span>
                </div>
              </div>
              
              <div className="gameplay-details">
                {game.gameplay.map((play, index) => (
                  <div key={index} className="gameplay-item">
                    <span className="board-name">{play.board}</span>
                    <span className="bet-type">{play.betType}</span>
                    <span className="numbers">{play.numbers}</span>
                    <span className="amount">₹{play.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-history">
            <p>No game history found</p>
            <button onClick={() => navigate('/')}>Start Playing</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentHistory;