import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Tag, Card, Statistic, Table } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useMediaQuery } from 'react-responsive'
import { agentAPI } from '../api/agent'

const AgentGameHistory = () => {
  const { agentId } = useParams()
  const navigate = useNavigate()
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const [gameHistory, setGameHistory] = useState([])
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalGames: 0,
    totalBetAmount: 0,
    totalWinAmount: 0,
    winRate: 0
  })

  useEffect(() => {
    fetchAgentGameHistory()
  }, [agentId])

  const fetchAgentGameHistory = async () => {
    try {
      const response = await agentAPI.getAgentGameHistoryById(agentId)
      const data = response.data || []
      setGameHistory(data)
      
      // Get agent details from first game history record
      if (data.length > 0 && data[0].agent) {
        setAgent(data[0].agent)
      }
      
      // Calculate stats
      const totalGames = data.length
      const totalBetAmount = data.reduce((sum, game) => sum + game.totalBetAmount, 0)
      const totalWinAmount = data.reduce((sum, game) => sum + game.totalWinAmount, 0)
      const wonGames = data.filter(game => game.isWon).length
      const winRate = totalGames > 0 ? ((wonGames / totalGames) * 100).toFixed(1) : 0
      
      setStats({ totalGames, totalBetAmount, totalWinAmount, winRate })
    } catch (error) {
      console.error('Error fetching agent game history:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
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
      title: 'Games Played',
      dataIndex: 'gameplay',
      key: 'games',
      width: 200,
      render: (gameplay) => (
        <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
          {gameplay?.map((play, index) => (
            <div key={index} style={{ fontSize: '12px', marginBottom: '4px' }}>
              {play.board} - {play.betType} - {play.numbers} (₹{play.amount})
            </div>
          ))}
        </div>
      )
    }
  ]

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '0 0.5rem' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/agents')}
        >
          Back
        </Button>
        <h2 style={{ margin: 0 }}>Agent Game History</h2>
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
          <Statistic title="Total Games" value={stats.totalGames} />
        </Card>
        <Card>
          <Statistic title="Total Bet Amount" value={stats.totalBetAmount} prefix="₹" />
        </Card>
        <Card>
          <Statistic title="Total Win Amount" value={stats.totalWinAmount} prefix="₹" />
        </Card>
        <Card>
          <Statistic title="Win Rate" value={stats.winRate} suffix="%" />
        </Card>
      </div>

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
          dataSource={gameHistory}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
          scroll={{ x: 680 }}
          size="small"
          locale={{
            emptyText: 'No game history found for this agent'
          }}
        />
      </div>
    </div>
  )
}

export default AgentGameHistory