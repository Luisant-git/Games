import React, { useState, useEffect } from 'react'
import { Table, InputNumber, Button, message, Typography } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { agentAPI } from '../api/agent'

const { Title } = Typography

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

  const columns = [
    {
      title: 'Board',
      dataIndex: ['game', 'board'],
      key: 'board',
    },
    {
      title: 'Bet Type',
      dataIndex: ['game', 'betType'],
      key: 'betType',
    },
    {
      title: 'Ticket',
      dataIndex: ['game', 'ticket'],
      key: 'ticket',
      render: (amount) => `₹${amount || 0}`,
    },
    {
      title: 'Commission Rate',
      key: 'commissionRate',
      render: (record) => (
        <InputNumber
          value={record.commissionRate}
          onChange={(value) => handleCommissionChange(record.gameId, value)}
          min={0}
          style={{ width: 100 }}
          addonAfter="₹"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleSave(record.gameId, record.commissionRate)}
        >
          Save
        </Button>
      ),
    },
  ]

  return (
    <div className="content">
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/agents')}
        >
          Back
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          Commission Management - {agentName}
        </Title>
      </div>
      
      <Table
        columns={columns}
        dataSource={commissions}
        rowKey="gameId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
      />
    </div>
  )
}

export default Commission