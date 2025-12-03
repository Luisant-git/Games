import React, { useState, useEffect } from 'react'
import { Card, Statistic, Table, Tag, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import { agentAPI } from '../api/agent'

const AgentOverview = () => {
  const [allGameHistory, setAllGameHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAgentGames: 0,
    totalAgentBets: 0,
    totalAgentWins: 0,
    activePlayingAgents: 0
  })
  const navigate = useNavigate()
  const isMobile = useMediaQuery({ maxWidth: 768 })

  useEffect(() => {
    fetchAllAgentGameHistory()
  }, [])

  const fetchAllAgentGameHistory = async () => {
    try {
      const response = await agentAPI.getAgentGameHistory()
      const data = response.data || []
      setAllGameHistory(data)
      
      // Calculate stats
      const totalAgentGames = data.length
      const totalAgentBets = data.reduce((sum, game) => sum + game.totalBetAmount, 0)
      const totalAgentWins = data.reduce((sum, game) => sum + game.totalWinAmount, 0)
      const uniqueAgents = [...new Set(data.map(game => game.agentId))].length
      
      setStats({
        totalAgentGames,
        totalAgentBets,
        totalAgentWins,
        activePlayingAgents: uniqueAgents
      })
    } catch (error) {
      console.error('Error fetching agent game history:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'S.No',
      key: 'sno',
      width: 70,
      fixed: isMobile ? false : 'left',
      render: (_, __, index) => index + 1
    },
    {
      title: 'Agent',
      dataIndex: ['agent', 'username'],
      key: 'agent',
      width: 120,
      render: (username, record) => (
        <div>
          <div>{username}</div>
        </div>
      )
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      width: 100,
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Show Time',
      dataIndex: 'showTime',
      key: 'showTime',
      width: 100,
      render: (time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      title: 'Bet Amount',
      dataIndex: 'totalBetAmount',
      key: 'betAmount',
      width: 100,
      render: (amount) => `₹${amount}`
    },
    {
      title: 'Win Amount',
      dataIndex: 'totalWinAmount',
      key: 'winAmount',
      width: 100,
      render: (amount) => `₹${amount}`
    },
    {
      title: 'Status',
      dataIndex: 'isWon',
      key: 'status',
      width: 80,
      render: (isWon) => (
        <Tag color={isWon ? 'green' : 'red'}>
          {isWon ? 'Won' : 'Lost'}
        </Tag>
      )
    },
    {
      title: 'Games',
      dataIndex: 'gameplay',
      key: 'games',
      width: 80,
      render: (gameplay) => gameplay?.length || 0
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/agents/${record.agent?.id}/game-history`)}
        >
          View Details
        </Button>
      )
    }
  ]

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div className="section-header" style={{ padding: '0 0.5rem' }}>
        <h2>Agent Gameplay Overview</h2>
      </div>
      
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px',
        padding: '0 0.5rem'
      }}>
        <Card>
          <Statistic title="Total Agent Games" value={stats.totalAgentGames} />
        </Card>
        <Card>
          <Statistic title="Total Bets by Agents" value={stats.totalAgentBets} prefix="₹" />
        </Card>
        <Card>
          <Statistic title="Total Wins by Agents" value={stats.totalAgentWins} prefix="₹" />
        </Card>
        <Card>
          <Statistic title="Active Playing Agents" value={stats.activePlayingAgents} />
        </Card>
      </div>

      {/* Game History Table */}
      <div style={{
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        border: '1px solid #d9d9d9',
        borderRadius: '6px',
        margin: '0 0.5rem'
      }}>
        <Table
          columns={columns}
          dataSource={allGameHistory}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
          scroll={{ x: 800 }}
          size="small"
        />
      </div>
    </div>
  )
}

export default AgentOverview