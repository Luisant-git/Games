import React, { useState, useEffect } from 'react'
import { Tag, Popconfirm, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { agentAPI } from '../api/agent'
import './Agent.css'

const Agent = () => {
    const [allAgents, setAllAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAgents()
      }, [])
    
      const fetchAgents = async () => {
        try {
          const data = await agentAPI.getAll()
          setAllAgents(data)
        } catch (error) {
          console.error('Error fetching all agents:', error)
        } finally {
          setLoading(false)
        }
      }


  const handleToggleStatus = async (agentId) => {
    try {
      await agentAPI.toggleStatus(agentId)
      message.success('Agent status updated successfully')
      fetchAgents()
    } catch (error) {
      message.error('Failed to update agent status')
    }
  }

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div className="section-header" style={{ padding: '0 0.5rem' }}>
        <h2>Agents Management</h2>
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
            <div style={{ minWidth: '900px' }}>
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Refer Code</th>
                    <th>Status</th>
                    <th>Wallet Balance</th>
                    <th>Players</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allAgents.map((agent) => (
                    <tr key={agent.id}>
                      <td>{agent.id}</td>
                      <td>{agent.name}</td>
                      <td>{agent.username}</td>
                      <td>{agent.referCode}</td>
                      <td>
                        <Popconfirm
                          title="Change Status"
                          description={`Are you sure you want to ${agent.isActive ? 'deactivate' : 'activate'} this agent?`}
                          onConfirm={() => handleToggleStatus(agent.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Tag 
                            color={agent.isActive ? 'green' : 'red'} 
                            style={{ cursor: 'pointer' }}
                          >
                            {agent.isActive ? 'Active' : 'Inactive'}
                          </Tag>
                        </Popconfirm>
                      </td>
                      <td>₹{agent.wallet?.balance || 0}</td>
                      <td>{agent.players?.length || 0}</td>
                      <td>{new Date(agent.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => navigate(`/agents/${agent.id}/commission`)}
                        >
                          Manage
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

export default Agent;