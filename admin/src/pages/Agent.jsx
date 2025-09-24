import React, { useState, useEffect } from 'react'
import { Tag, Popconfirm, Button, Modal, Form, Input } from 'antd'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { agentAPI } from '../api/agent'
import './Agent.css'

const Agent = () => {
    const [allAgents, setAllAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
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
      toast.success('Agent status updated successfully', { position: 'top-center' })
      fetchAgents()
    } catch (error) {
      toast.error('Failed to update agent status', { position: 'top-center' })
    }
  }

  const handleTogglePlayPermission = async (agentId) => {
    try {
      await agentAPI.togglePlayPermission(agentId)
      toast.success('Agent play permission updated successfully', { position: 'top-center' })
      fetchAgents()
    } catch (error) {
      toast.error('Failed to update agent play permission', { position: 'top-center' })
    }
  }

  const handleAddAgent = async (values) => {
    try {
      setLoading(true)
      await agentAPI.create(values)
      toast.success('Agent created successfully', { position: 'top-center' })
      setIsModalVisible(false)
      form.resetFields()
      fetchAgents()
    } catch (error) {
      const errorMessage = error.message || 'Failed to create agent'
      toast.error(errorMessage, { position: 'top-center' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div className="section-header" style={{ padding: '0 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Agents Management</h2>
        <Button type="primary" onClick={() => setIsModalVisible(true)}>
          Add Agent
        </Button>
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
                    <th>Can Play</th>
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
                      <td>
                        <Popconfirm
                          title="Change Play Permission"
                          description={`Are you sure you want to ${agent.canPlay ? 'disable' : 'enable'} gameplay for this agent?`}
                          onConfirm={() => handleTogglePlayPermission(agent.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Tag 
                            color={agent.canPlay ? 'blue' : 'orange'} 
                            style={{ cursor: 'pointer' }}
                          >
                            {agent.canPlay ? 'Can Play' : 'No Play'}
                          </Tag>
                        </Popconfirm>
                      </td>
                      <td>₹{Math.round((agent.wallet?.balance || 0) * 100) / 100}</td>
                      <td>{agent.players?.length || 0}</td>
                      <td>{new Date(agent.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => navigate(`/agents/${agent.id}/commission`)}
                          >
                            Commission
                          </Button>
                          <Button
                            type="default"
                            size="small"
                            onClick={() => navigate(`/agents/${agent.id}/game-history`)}
                          >
                            Games
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          

        </>
      )}
      
      <Modal
        title="Add New Agent"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddAgent}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter agent name' }]}
          >
            <Input placeholder="Enter agent name" />
          </Form.Item>
          
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter username' }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={() => {
              setIsModalVisible(false);
              form.resetFields();
            }} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Agent
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Agent;