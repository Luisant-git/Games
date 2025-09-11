import { useState, useEffect } from "react";
import { getPlayerGameHistory } from "../api/games";
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
      const response = await getPlayerGameHistory();
      const historyData = await response.json();
      setHistory(historyData);

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
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="history">
      <div className="history-header">
        <h2>📊 Game History</h2>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{stats.totalGames}</span>
          <span className="stat-label">Total Games</span>
        </div>
        {/* <div className="stat-card wins">
          <span className="stat-number">{stats.totalWon}</span>
          <span className="stat-label">Games Won</span>
        </div>
        <div className="stat-card earnings">
          <span className="stat-number">₹{stats.totalWinnings}</span>
          <span className="stat-label">Total Winnings</span>
        </div> */}
        {/* {stats.totalCommissions > 0 && (
          <div className="stat-card commission">
            <span className="stat-number">₹{stats.totalCommissions}</span>
            <span className="stat-label">Agent Commission</span>
          </div>
        )} */}
      </div>

      <div className="history-list">
        {loading ? (
          <div className="loading">Loading history...</div>
        ) : history.length > 0 ? (
          history
            .filter((game) => !game.isWon)
            .map((game, index) => (
              <div key={game.id} className="history-item">
                <div className="game-info">
                  <div className="game-meta">
                    <h4>{game.categoryName}</h4>
                    <span>📅 {formatDate(game.showTime)}</span>
                  </div>
                  <div className="gameplay-details">
                    {game.gameplay.map((play) => (
                      <div key={play.id} className="play-item">
                        <span className="board">{play.board}</span>
                        <span className="bet-type">
                          {play.betType.replace("_", " ")}
                        </span>
                        <span className="numbers">
                          {["TRIPLE_DIGIT", "FOUR_DIGIT"].includes(play.betType)
                            ? JSON.parse(play.numbers).join("")
                            : play.numbers}
                        </span>
                        <span className="qty">×{play.qty}</span>
                        <span className="amount">₹{play.amount}</span>
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
                      <span>Potential Win</span>
                      <span>₹{game.totalWinAmount}</span>
                    </div>
                    {/* <div className='win-amount'>
                    <span>Agent commission</span>
                    <span>₹{game.agentCommission}</span>
                  </div> */}
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
