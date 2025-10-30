import { useEffect, useState } from "react";
import { playerAPI } from "../api/player";
import './Users.css';

const Users = () => {
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  
      useEffect(() => {
          fetchPlayers()
        }, [])
      
        const fetchPlayers = async () => {
          try {
            const data = await playerAPI.getAll()
            setAllPlayers(data)
          } catch (error) {
            console.error('Error fetching all players:', error)
          } finally {
            setLoading(false)
          }
        }


  const renderMobileCard = (player) => (
    <div key={player.id} className="mobile-card">
      <div className="mobile-card-header">
        <span className="mobile-card-id">#{player.id}</span>
        <span className="mobile-card-value">{player.name}</span>
      </div>
      <div className="mobile-card-body">
        <div className="mobile-card-row">
          <span className="mobile-card-label">Email:</span>
          <span className="mobile-card-value">{player.email}</span>
        </div>
        <div className="mobile-card-row">
          <span className="mobile-card-label">Phone:</span>
          <span className="mobile-card-value">{player.phone}</span>
        </div>
        <div className="mobile-card-row">
          <span className="mobile-card-label">Referral Code:</span>
          <span className="mobile-card-value">{player.referalCode || 'N/A'}</span>
        </div>
        <div className="mobile-card-row">
          <span className="mobile-card-label">Wallet Balance:</span>
          <span className="mobile-card-value">₹{player.wallet?.balance || 0}</span>
        </div>
        <div className="mobile-card-row">
          <span className="mobile-card-label">Created:</span>
          <span className="mobile-card-value">{new Date(player.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div className="section-header" style={{ padding: '0 0.5rem' }}>
        <h2>Player Management</h2>
      </div>
      
      {/* Table View */}
      <div style={{
        width: '100%',
        overflowX: 'scroll',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        border: '1px solid #d9d9d9',
        borderRadius: '6px',
        margin: '0 0.5rem'
      }}>
        <div style={{ minWidth: '800px' }}>
          <table className="responsive-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Phone</th>
                <th>Referral Code</th>
                <th>Wallet Balance</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {allPlayers.map((player) => (
                <tr key={player.id}>
                  <td>{player.username}</td>
                  <td>{player.phone}</td>
                  <td>{player.referalCode || 'N/A'}</td>
                  <td>₹{player.wallet?.balance || 0}</td>
                  <td>{new Date(player.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      

    </div>
  )
}

export default Users