import { useState, useEffect } from 'react'
import { agentAPI } from '../api/agent'

const Dashboard = () => {
  const [agentStats, setAgentStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    playingAgents: 0,
    totalCommissions: 0
  })

  useEffect(() => {
    fetchAgentStats()
  }, [])

  const fetchAgentStats = async () => {
    try {
      const agents = await agentAPI.getAll()
      const totalAgents = agents.length
      const activeAgents = agents.filter(agent => agent.isActive).length
      const playingAgents = agents.filter(agent => agent.canPlay).length
      const totalCommissions = agents.reduce((sum, agent) => sum + (agent.wallet?.balance || 0), 0)
      
      setAgentStats({ totalAgents, activeAgents, playingAgents, totalCommissions })
    } catch (error) {
      console.error('Error fetching agent stats:', error)
    }
  }

  const stats = [
    { label: 'Total Agents', value: agentStats.totalAgents, change: '+12%', color: 'success' },
    { label: 'Active Agents', value: agentStats.activeAgents, change: '+8%', color: 'success' },
    { label: 'Playing Agents', value: agentStats.playingAgents, change: '+5%', color: 'success' },
    { label: 'Total Commissions', value: `₹${agentStats.totalCommissions}`, change: '+15%', color: 'success' }
  ]

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <h3>{stat.label}</h3>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-change ${stat.color}`}>{stat.change}</div>
          </div>
        ))}
      </div>
      
      <div className="charts-section">
        <div className="chart-card">
          <h3>Revenue Overview</h3>
          <div className="chart-placeholder">📊 Chart Area</div>
        </div>
        <div className="chart-card">
          <h3>User Activity</h3>
          <div className="chart-placeholder">📈 Chart Area</div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard