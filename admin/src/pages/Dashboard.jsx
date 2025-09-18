import React, { useState, useEffect } from 'react'
import { Table, Select, Card, Row, Col, Statistic, Spin, Button } from 'antd'
import { todayGameAPI } from '../api/todayGame'
import { useMediaQuery } from 'react-responsive'
import { getDashboardMetrics } from '../api/dashboard'

const { Option } = Select

const Dashboard = () => {
  const [timings, setTimings] = useState([])
  const [selectedTime, setSelectedTime] = useState('')
  const [gameHistoryData, setGameHistoryData] = useState(null)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [analysisData, setAnalysisData] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [matrics, setMatrics] = useState(null)
  const isMobile = useMediaQuery({ maxWidth: 768 })

  useEffect(() => {
    fetchTimings()
    getMatrics();
  }, [])

  const fetchTimings = async () => {
    try {
      const data = await todayGameAPI.getTimings()
      setTimings(data)
    } catch (error) {
      console.error('Error fetching timings:', error)
    }
  }

  const fetchGameHistory = async (showTime) => {
    if (!showTime) return
    
    setLoading(true)
    try {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const fullShowTime = `${today} ${showTime}:00`
      
      console.log('=== FRONTEND TIMEZONE DEBUG ===')
      console.log('Browser timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone)
      console.log('Current date object:', now)
      console.log('Today (ISO):', today)
      console.log('Selected time:', showTime)
      console.log('Full showTime being sent:', fullShowTime)
      
      const data = await todayGameAPI.getGameHistoryByShowTime(fullShowTime)
      setGameHistoryData(data)
    } catch (error) {
      console.error('Error fetching game history:', error)
      setGameHistoryData(null)
    } finally {
      setLoading(false)
    }
  }

  const getMatrics = async () =>{
    const response = await getDashboardMetrics();
    if (response.success) {
      console.log(response.data)
      setMatrics(response.data)
    }
  }

  const formatTimeToAMPM = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleTimeChange = (time) => {
    setSelectedTime(time)
    setExpandedRows(new Set())
    setAnalysisData(null)
    fetchGameHistory(time)
  }

  const handleAnalyze = async () => {
    if (!selectedTime) return
    
    setAnalyzing(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const fullShowTime = `${today} ${selectedTime}:00`
      const data = await todayGameAPI.analyzeOptimalResult(fullShowTime)
      setAnalysisData(data)
    } catch (error) {
      console.error('Error analyzing result:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const toggleRowExpansion = (categoryId) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedRows(newExpanded)
  }

  const columns = [
    {
      title: '',
      key: 'expand',
      width: 40,
      render: (_, record, index) => (
        <Button
          type="text"
          size="small"
          onClick={() => toggleRowExpansion(index)}
          icon={expandedRows.has(index) ? 
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14v2z"/>
            </svg> : 
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          }
          style={{
            padding: '4px',
            minWidth: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      )
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 100,
      ellipsis: true
    },
    {
      title: 'Show Time',
      dataIndex: 'showTime',
      key: 'showTime',
      width: 90,
      render: (time) => new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})
    },
    {
      title: 'Play Start',
      dataIndex: 'playStart',
      key: 'playStart',
      width: 90,
      render: (time) => new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})
    },
    {
      title: 'Play End',
      dataIndex: 'playEnd',
      key: 'playEnd',
      width: 90,
      render: (time) => new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})
    },
    {
      title: 'Total Bet',
      dataIndex: 'totalBetAmount',
      key: 'totalBetAmount',
      width: 90,
      render: (amount) => `₹${amount}`
    },
    {
      title: 'Commission',
      dataIndex: 'totalAgentCommissionAmount',
      key: 'totalAgentCommissionAmount',
      width: 90,
      render: (amount) => `₹${amount}`
    },
    // {
    //   title: 'Records',
    //   dataIndex: 'recordCount',
    //   key: 'recordCount',
    //   width: 70
    // }
  ]

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '100vw', 
      padding: '0 8px',
      '@media (max-width: 768px)': {
        padding: '0 4px'
      }
    }}>
      <div className="section-header" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Dashboard</h2>
      </div>

      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8} lg={6}>
          <Card size="small">
            <Statistic
              title="Total Games"
              value={matrics?.totalProfit || 0}
              prefix="₹"
              valueStyle={{ fontSize: '1.2rem' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card size="small">
            <Statistic
              title="Total Bet Amount"
              value={matrics?.totalBetAmount || 0}
              prefix="₹"
              valueStyle={{ fontSize: '1.2rem' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={6}>
          <Card size="small">
            <Statistic
              title="Total Commission"
              value={matrics?.totalAgentCommission || 0}
              prefix="₹"
              valueStyle={{ fontSize: '1.2rem' }}
            />
          </Card>
        </Col>
      </Row>

      {/* <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Revenue Trend" size="small" style={{ height: 280 }}>
            <div style={{ position: 'relative', height: 220, padding: '10px' }}>
              <svg width="100%" height="100%" viewBox="0 0 400 180">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1890ff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#1890ff" stopOpacity="0.05" />
                  </linearGradient>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                  </filter>
                </defs>
                
             
                <g stroke="#f0f0f0" strokeWidth="1">
                  <line x1="40" y1="20" x2="40" y2="140" />
                  <line x1="100" y1="20" x2="100" y2="140" />
                  <line x1="160" y1="20" x2="160" y2="140" />
                  <line x1="220" y1="20" x2="220" y2="140" />
                  <line x1="280" y1="20" x2="280" y2="140" />
                  <line x1="340" y1="20" x2="340" y2="140" />
                  
                  <line x1="40" y1="40" x2="340" y2="40" />
                  <line x1="40" y1="70" x2="340" y2="70" />
                  <line x1="40" y1="100" x2="340" y2="100" />
                  <line x1="40" y1="130" x2="340" y2="130" />
                </g>
                
           
                <path
                  d="M40,100 L100,60 L160,110 L220,30 L280,50 L340,45 L340,140 L40,140 Z"
                  fill="url(#areaGradient)"
                />
                
              
                <path
                  d="M40,100 L100,60 L160,110 L220,30 L280,50 L340,45"
                  fill="none"
                  stroke="#1890ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#shadow)"
                />
                
           
                <circle cx="40" cy="100" r="5" fill="#fff" stroke="#1890ff" strokeWidth="3" />
                <circle cx="100" cy="60" r="5" fill="#fff" stroke="#1890ff" strokeWidth="3" />
                <circle cx="160" cy="110" r="5" fill="#fff" stroke="#1890ff" strokeWidth="3" />
                <circle cx="220" cy="30" r="5" fill="#fff" stroke="#1890ff" strokeWidth="3" />
                <circle cx="280" cy="50" r="5" fill="#fff" stroke="#1890ff" strokeWidth="3" />
                <circle cx="340" cy="45" r="5" fill="#fff" stroke="#1890ff" strokeWidth="3" />
                
            
                <text x="40" y="160" textAnchor="middle" fontSize="12" fill="#666">Mon</text>
                <text x="100" y="160" textAnchor="middle" fontSize="12" fill="#666">Tue</text>
                <text x="160" y="160" textAnchor="middle" fontSize="12" fill="#666">Wed</text>
                <text x="220" y="160" textAnchor="middle" fontSize="12" fill="#666">Thu</text>
                <text x="280" y="160" textAnchor="middle" fontSize="12" fill="#666">Fri</text>
                <text x="340" y="160" textAnchor="middle" fontSize="12" fill="#666">Sat</text>
              </svg>
            </div>
          </Card>
        </Col>
      </Row> */}

      <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <Select
          placeholder="Select Show Time"
          value={selectedTime}
          onChange={handleTimeChange}
          style={{ width: '100%', maxWidth: 200 }}
          allowClear
        >
          {timings.map(timing => 
            timing.showTimes?.map(showTime => (
              <Option key={showTime.id} value={showTime.showTime}>
                {formatTimeToAMPM(showTime.showTime)}
              </Option>
            ))
          )}
        </Select>
        {selectedTime && (
          <Button 
            type="primary" 
            onClick={handleAnalyze}
            loading={analyzing}
            style={{ minWidth: 120 }}
          >
            Analyze Result
          </Button>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      )}

      {selectedTime && gameHistoryData && (
        <div style={{
          width: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <Table
            columns={columns}
            dataSource={gameHistoryData.summary || []}
            rowKey={(record, index) => index}
            loading={loading}
            pagination={false}
            size="small"
            scroll={{ x: 600 }}
            expandable={{
              expandedRowRender: (record, index) => {
                const detailColumns = [
                  { title: 'Player', key: 'player', width: 100, render: (detail) => detail.player?.username || 'N/A', ellipsis: true },
                  { title: 'Agent', key: 'agent', width: 100, render: (detail) => detail.agent?.username || 'N/A', ellipsis: true },
                  { title: 'Bet Amount', key: 'betAmount', width: 90, render: (detail) => `₹${detail.totalBetAmount}` },
                  { title: 'Win Amount', key: 'winAmount', width: 90, render: (detail) => `₹${detail.totalWinAmount}` },
                  { title: 'Commission', key: 'commission', width: 90, render: (detail) => `₹${detail.agentCommission}` },
                  { title: 'Games', key: 'games', width: 70, render: (detail) => detail.gameplay?.length || 0 }
                ]
                
                const filteredDetails = gameHistoryData.details?.filter(detail => 
                  detail.categoryName === record.categoryName
                ) || []
                
                return (
                  <Table
                    columns={detailColumns}
                    dataSource={filteredDetails}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    scroll={{ x: 400 }}
                    style={{ margin: '8px 0' }}
                  />
                )
              },
              expandedRowKeys: Array.from(expandedRows),
              onExpand: (expanded, record) => {
                const index = gameHistoryData.summary.indexOf(record)
                toggleRowExpansion(index)
              },
              showExpandColumn: false,
              rowExpandable: (record) => {
                const filteredDetails = gameHistoryData.details?.filter(detail => 
                  detail.categoryName === record.categoryName
                ) || []
                return filteredDetails.length > 0
              }
            }}
          />
        </div>
      )}

      {analysisData && (
        <div style={{ marginTop: 24 }}>
          <Card title="Result Analysis" size="small">
            <div style={{ marginBottom: 16 }}>
              <h3>Optimal Number: {analysisData.optimalNumber}</h3>
              <p>Maximum Profit: ₹{analysisData.maxProfit}</p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                {Object.entries(analysisData.boards || {}).map(([board, value]) => (
                  <span key={board} style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: 4,
                    fontSize: '12px'
                  }}>
                    {board}: {value}
                  </span>
                ))}
              </div>
            </div>
            
            <Table
              columns={[
                { title: 'Number', dataIndex: 'number', key: 'number', width: 80 },
                { title: 'Profit', dataIndex: 'profit', key: 'profit', width: 80, render: (val) => `₹${val}` },
                { title: 'Win Rate', dataIndex: 'winRate', key: 'winRate', width: 80, render: (val) => `${val}%` },
                { title: 'Winning Bets', dataIndex: 'winningBets', key: 'winningBets', width: 100 },
                { title: 'Total Bets', dataIndex: 'totalBets', key: 'totalBets', width: 90 },
                { title: 'Bet Amount', dataIndex: 'totalBetAmount', key: 'totalBetAmount', width: 100, render: (val) => `₹${val}` },
                { title: 'Win Amount', dataIndex: 'totalWinAmount', key: 'totalWinAmount', width: 100, render: (val) => `₹${val}` }
              ]}
              dataSource={analysisData.topResults || []}
              rowKey="number"
              pagination={false}
              size="small"
              scroll={{ x: 600 }}
            />
          </Card>
        </div>
      )}
    </div>
  )
}

export default Dashboard