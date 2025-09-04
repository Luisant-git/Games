import React, { useState, useEffect } from 'react'
import { InputNumber, Button, message } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { agentAPI } from '../api/agent'
import './Commission.css'

const Commission = () => {
  const { agentId } = useParams()
  const navigate = useNavigate()
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [agentName, setAgentName] = useState('')

  useEffect(() => {
    fetchCommissions()
  }, [agentId])

  const fetchCommissions = async () => {
    try {
      const data = await agentAPI.getCommissions(agentId)
      setCommissions(data)
      console.log('-------setCommissions: ', data);
      
      
      if (data.length > 0) {
        // Get agent name from first commission record
        setAgentName(data[0]?.agent?.name || 'Agent')
      }
    } catch (error) {
      console.error('Error fetching commissions:', error)
      message.error('Failed to fetch commissions')
    } finally {
      setLoading(false)
    }
  }

  const handleCommissionChange = (gameId, value) => {
    setCommissions(prev => 
      prev.map(item => 
        item.gameId === gameId 
          ? { ...item, commissionRate: value }
          : item
      )
    )
  }

  const handleSave = async (gameId, commissionRate) => {
    try {
      await agentAPI.updateCommission(agentId, gameId, commissionRate)
      message.success('Commission updated successfully')
    } catch (error) {
      message.error('Failed to update commission')
    }
  }

  const renderMobileCard = (record) => (
    <div key={record.gameId} className="mobile-card">
      <div className="mobile-card-header">
        <span>{record.game?.board}</span>
        <span>{record.game?.betType}</span>
      </div>
      <div className="mobile-card-body">
        <div className="mobile-card-row">
          <span className="mobile-card-label">Ticket:</span>
          <span className="mobile-card-value">₹{record.game?.ticket || 0}</span>
        </div>
        <div className="mobile-card-row">
          <span className="mobile-card-label">Commission Rate:</span>
          <InputNumber
            value={record.commissionRate}
            onChange={(value) => handleCommissionChange(record.gameId, value)}
            min={0}
            size="small"
            addonAfter="₹"
          />
        </div>
      </div>
      <div className="mobile-card-actions">
        <Button
          type="primary"
          size="small"
          onClick={() => handleSave(record.gameId, record.commissionRate)}
          block
        >
          Save
        </Button>
      </div>
    </div>
  )

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div className="commission-header" style={{ padding: '0 0.5rem' }}>
        <Button onClick={() => navigate('/agents')}>← Back</Button>
        <h2>Commission Management - {agentName}</h2>
      </div>
      
      {loading ? (
        <div className="loading-container">Loading...</div>
      ) : (
        <>
          {/* Table */}
          <div style={{
            width: '100%',
            overflowX: 'scroll',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            margin: '0 0.5rem'
          }}>
            <div style={{ minWidth: '700px' }}>
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Board</th>
                    <th>Bet Type</th>
                    <th>Ticket</th>
                    <th>Commission Rate</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((record) => (
                    <tr key={record.gameId}>
                      <td>{record.game?.board}</td>
                      <td>{record.game?.betType}</td>
                      <td>₹{record.game?.ticket || 0}</td>
                      <td>
                        <InputNumber
                          value={record.commissionRate}
                          onChange={(value) => handleCommissionChange(record.gameId, value)}
                          min={0}
                          size="small"
                          addonAfter="₹"
                        />
                      </td>
                      <td>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => handleSave(record.gameId, record.commissionRate)}
                        >
                          Save
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          

        </>
      )}
    </div>
  )
}

export default Commission