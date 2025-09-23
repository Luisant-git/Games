import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAgentPlayers } from '../api/auth';
import './MyPlayers.css';

const MyPlayers = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPlayers();
  }, []);

  const fetchMyPlayers = async () => {
    try {
      const response = await getAgentPlayers();
      if (response.ok) {
        const result = await response.json();
        const gameHistories = result.data || [];
        
        // Process game histories to create player statistics
        const playerStats = {};
        let totalCommission = 0;
        
        gameHistories.forEach(history => {
          const playerId = history.player.id;
          const playerName = history.player.username;
          
          if (!playerStats[playerId]) {
            playerStats[playerId] = {
              id: playerId,
              username: playerName,
              totalGames: 0,
              totalWinnings: 0,
              totalLosses: 0,
              totalCommission: 0,
              lastPlayed: null,
              status: 'active'
            };
          }
          
          playerStats[playerId].totalGames += 1;
          playerStats[playerId].totalWinnings += history.totalWinAmount || 0;
          playerStats[playerId].totalLosses += history.isWon ? 0 : history.totalBetAmount;
          playerStats[playerId].totalCommission += history.agentCommission || 0;
          totalCommission += history.agentCommission || 0;
          
          const gameDate = new Date(history.createdAt);
          const formattedDate = `${gameDate.getDate().toString().padStart(2, '0')}-${(gameDate.getMonth() + 1).toString().padStart(2, '0')}-${gameDate.getFullYear()}`;
          if (!playerStats[playerId].lastPlayed || gameDate > new Date(playerStats[playerId].lastPlayedRaw)) {
            playerStats[playerId].lastPlayed = formattedDate;
            playerStats[playerId].lastPlayedRaw = history.createdAt;
          }
        });
        
        setPlayers(Object.values(playerStats));
        setTotalCommission(totalCommission);
        
        setPlayers(Object.values(playerStats));
      } else {
        console.error('Failed to fetch players');
        setPlayers([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching players:', error);
      setPlayers([]);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading players...</div>;
  }

  return (
    <div className="my-players">
      <div className="page-header">
        <h1>My Players</h1>
      </div>

      <div className="players-stats">
        <div className="stat-card">
          <span className="stat-number">{players.length}</span>
          <span className="stat-label">Total Players</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">₹{totalCommission.toFixed(2)}</span>
          <span className="stat-label">Total Commission</span>
        </div>
      </div>

      <div className="players-list">
        {players.map(player => (
          <div key={player.id} className="player-card">
            <div className="player-info">
              <div className="player-avatar">👤</div>
              <div className="player-details">
                <h3>{player.username}</h3>
                <span className="player-status">{player.status}</span>
              </div>
            </div>
            
            <div className="player-stats">
              <div className="stat-row">
                <span className="stat-label">Games Played:</span>
                <span className="stat-value">{player.totalGames}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total Winnings:</span>
                <span className="stat-value win">₹{player.totalWinnings}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Total Losses:</span>
                <span className="stat-value loss">₹{player.totalLosses}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Commission Earned:</span>
                <span className="stat-value win">₹{player.totalCommission.toFixed(2)}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Last Played:</span>
                <span className="stat-value">{player.lastPlayed}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPlayers;