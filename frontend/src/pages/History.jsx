import { useState, useEffect } from "react";
import { getPlayerGameHistory, getAgentGameHistory } from "../api/games";
import "./History.css";

const History = () => {
  const [history, setHistory] = useState([]);
  console.log(history, "<--- history");

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalWon: 0,
    totalWinnings: 0,
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const userType = localStorage.getItem('userType');
      let response;
      if (userType === 'agent') {
        const user = JSON.parse(localStorage.getItem('user'));
        const agentId = user?.id;
        response = await getAgentGameHistory(agentId);
      } else {
        response = await getPlayerGameHistory();
      }
      const historyData = await response.json();
      setHistory(userType === 'agent' ? historyData.data || [] : historyData);

      const totalGames = historyData.length;
      const totalWon = historyData.filter((game) => game.isWon).length;
      const totalWinnings = historyData.reduce(
        (sum, game) => sum + game.totalWinAmount,
        0
      );
      const totalCommissions = historyData.reduce(
        (sum, game) => sum + game.agentCommission,
        0
      );

      setStats({ totalGames, totalWon, totalWinnings, totalCommissions });
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
    const formattedDate = date.toLocaleDateString("en-GB").replace(/\//g, '-');
    return `${time}, ${formattedDate}`;
  };

  return (
    <div className="history">
      <div className="history-header">
        <h2>📊 Game History</h2>
      </div>

      <div className="history-list">
        {loading ? (
          <div className="loading">Loading history...</div>
        ) : history.length > 0 ? (
          history.map((game, index) => (
              <div key={game.id} className="history-item">
                <div className="game-info">
                  <div className="game-meta">
                    <h4>{game.categoryName}</h4>
                    <span>📅 {formatDate(game.showTime)}</span>
                  </div>
                  <div className="gameplay-details">
                    {Object.entries(game.gameplay.reduce((acc, play) => {
                      const board = play.board || 'UNKNOWN';
                      if (!acc[board]) acc[board] = [];
                      acc[board].push(play);
                      return acc;
                    }, {})).map(([board, plays]) => (
                      <div key={board} className="board-group">
                        <div className="board-title">{board}</div>
                        {plays.map((play) => (
                          <div key={play.id} className={`play-item ${play.winAmount && play.winAmount > 0 ? 'winning-play' : ''}`}>
                            <div className="bet-info">
                              <span className="pre-amount">
                                {["TRIPLE_DIGIT", "FOUR_DIGIT"].includes(play.betType)
                                  ? JSON.parse(play.numbers).join("")
                                  : play.numbers}
                              </span>
                              <span className="pre-amount">x</span>
                              <span className="pre-amount">{play.qty}</span>
                            </div>
                            <span className="amount">₹{play.amount}</span>
                            {play.winAmount && play.winAmount > 0 && (
                              <span className="win-amount-display">Won: ₹{play.winAmount}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="game-result">
                  <div className="amounts">
                    <div className="bet-amount">
                      <span>Total Bet</span>
                      <span>₹{game.totalBetAmount}</span>
                    </div>
                    <div className="win-amount">
                      <span>Total Win</span>
                      <span>₹{game.totalWinAmount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="no-history">
            <p>
              No game history found. Start playing to see your results here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
