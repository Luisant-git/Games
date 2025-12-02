import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAgentPlayers, getAgentProfile } from '../api/auth';
import './MyPlayers.css';

const MyPlayers = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlayerHistory, setSelectedPlayerHistory] = useState([]);
  const [selectedPlayerName, setSelectedPlayerName] = useState('');

  useEffect(() => {
    fetchMyPlayers();
  }, []);

  const fetchMyPlayers = async () => {
    try {
      // Fetch profile to get all players
      const profileResponse = await getAgentProfile();
      if (!profileResponse.ok) {
        console.error('Failed to fetch profile');
        setPlayers([]);
        setLoading(false);
        return;
      }
      
      const profile = await profileResponse.json();
      const allPlayers = profile.players || [];
      
      // Initialize player stats
      const playerStats = {};
      let totalCommission = 0;
      let totalAmt = 0;
      let totalWin = 0;
      
      // Initialize all players with zero stats
      allPlayers.forEach(player => {
        playerStats[player.id] = {
          id: player.id,
          username: player.username,
          entries: 0,
          totalAmount: 0,
          commission: 0,
          winningAmount: 0,
          gameHistory: [],
        };
      });
      
      // Try to fetch game histories
      try {
        const historyResponse = await getAgentPlayers();
        if (historyResponse.ok) {
          const historyResult = await historyResponse.json();
          const gameHistories = historyResult.data || [];
          
          // Update stats from game histories
          gameHistories.forEach(history => {
            const playerId = history.player?.id;
            
            if (playerId && playerStats[playerId]) {
              playerStats[playerId].entries += 1;
              playerStats[playerId].totalAmount += history.totalBetAmount || 0;
              playerStats[playerId].commission += history.agentCommission || 0;
              playerStats[playerId].winningAmount += history.totalWinAmount || 0;
              playerStats[playerId].gameHistory.push(history);
              
              totalCommission += history.agentCommission || 0;
              totalAmt += history.totalBetAmount || 0;
              totalWin += history.totalWinAmount || 0;
            }
          });
        }
      } catch (historyError) {
        console.error('Error fetching game histories:', historyError);
        // Continue with zero stats
      }
      
      setPlayers(Object.values(playerStats).map((p, i) => ({ sno: i + 1, ...p })));
      setTotalCommission(totalCommission);
      setTotalAmount(totalAmt);
      setTotalWinnings(totalWin);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching players:', error);
      setPlayers([]);
      setLoading(false);
    }
  };

  const handleSeeMore = (player) => {
    const historyData = player.gameHistory?.map((history, index) => {
      const showDateTime = new Date(history.showTime);
      const hours = showDateTime.getHours();
      const minutes = showDateTime.getMinutes().toString().padStart(2, '0');
      const showtime = `${hours}:${minutes}`;
      
      return {
        sno: index + 1,
        category: history.category?.name || 'N/A',
        showDate: history.showTime || 'N/A',
        showtime: showtime,
        entries: history.gameplay?.length || 1,
        totalAmount: history.totalBetAmount || 0,
        commission: history.agentCommission || 0,
        winningAmount: history.totalWinAmount || 0,
      };
    }) || [];
    setSelectedPlayerHistory(historyData);
    setSelectedPlayerName(player.username);
    setModalVisible(true);
  };

  const formatTime = (time) => {
    if (!time || typeof time !== 'string') return 'N/A';
    const parts = time.split(':');
    if (parts.length < 2) return 'N/A';
    const hours = parts[0];
    const minutes = parts[1] || '00';
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
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
          <span className="stat-label">Commission</span>
        </div>
      </div>

      <div className="players-table">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Player Name</th>
              <th>Entries</th>
              <th>Total Amount</th>
              <th>Commission</th>
              <th>Winning Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.id}>
                <td>{player.sno}</td>
                <td>{player.username}</td>
                <td>{player.entries}</td>
                <td>₹{player.totalAmount.toFixed(2)}</td>
                <td>₹{player.commission.toFixed(2)}</td>
                <td>₹{player.winningAmount.toFixed(2)}</td>
                <td>
                  <button 
                    className="see-more-btn" 
                    onClick={() => handleSeeMore(player)}
                    disabled={!player.gameHistory || player.gameHistory.length === 0}
                  >
                    See More
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Game History - {selectedPlayerName}</h2>
              <button className="modal-close" onClick={() => setModalVisible(false)}>×</button>
            </div>
            <div className="modal-body">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Category</th>
                    <th>Show Date</th>
                    <th>Showtime</th>
                    <th>Entries</th>
                    <th>Total Amount</th>
                    <th>Commission</th>
                    <th>Winning Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPlayerHistory.map(history => (
                    <tr key={history.sno}>
                      <td>{history.sno}</td>
                      <td>{history.category}</td>
                      <td>{formatDate(history.showDate)}</td>
                      <td>{formatTime(history.showtime)}</td>
                      <td>{history.entries}</td>
                      <td>₹{history.totalAmount.toFixed(2)}</td>
                      <td>₹{history.commission.toFixed(2)}</td>
                      <td>₹{history.winningAmount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPlayers;