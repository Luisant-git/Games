import React, { useState, useEffect } from 'react'
import { Table, Tag, Popconfirm, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { agentAPI } from '../api/agent'

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
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Refer Code',
      dataIndex: 'referCode',
      key: 'referCode',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Popconfirm
          title="Change Status"
          description={`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this agent?`}
          onConfirm={() => handleToggleStatus(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Tag 
            color={isActive ? 'green' : 'red'} 
            style={{ cursor: 'pointer' }}
          >
            {isActive ? 'Active' : 'Inactive'}
          </Tag>
        </Popconfirm>
      ),
    },
    {
      title: 'Wallet Balance',
      key: 'balance',
      render: (record) => `₹${record.wallet?.balance || 0}`,
    },
    {
      title: 'Players',
      key: 'players',
      render: (record) => record.players?.length || 0,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => navigate(`/agents/${record.id}/commission`)}
        >
          Manage
        </Button>
      ),
    },

  ]

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
    <div className="content">
      <div className="section-header">
        <h2>Agents Management</h2>
      </div>
      
      <Table
        columns={columns}
        dataSource={allAgents}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        scroll={{ x: 800 }}
      />
    </div>
  )
}

export default Agent;