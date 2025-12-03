import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { gamesAPI } from '../api/games'
import { useMediaQuery } from 'react-responsive'

const { Option } = Select

const Games = () => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGame, setEditingGame] = useState(null)
  const [form] = Form.useForm()
  const isMobile = useMediaQuery({ maxWidth: 1024 })

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const data = await gamesAPI.getAll()
      setGames(data)
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async (id) => {
    try {
      await gamesAPI.delete(id)
      fetchGames()
    } catch (error) {
      console.error('Error deleting game:', error)
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingGame) {
        await gamesAPI.update(editingGame.id, values)
      } else {
        await gamesAPI.create(values)
      }
      handleCancel()
      fetchGames()
    } catch (error) {
      console.error('Error saving game:', error)
    }
  }

  const handleEdit = (game) => {
    setEditingGame(game)
    form.setFieldsValue({
      betType: game.betType || 'SINGLE',
      board: game.board || '',
      winningAmount: game.winningAmount || 0,
      ticket: game.ticket || 0,
      singleDigitMatching: game.singleDigitMatching || 0,
      doubleDigitMatching: game.doubleDigitMatching || 0,
      tripleDigitMatching: game.tripleDigitMatching || 0
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingGame(null)
    form.resetFields()
  }

  const handleToggleActive = async (id) => {
    try {
      await gamesAPI.toggleActive(id)
      fetchGames()
    } catch (error) {
      console.error('Error toggling game status:', error)
    }
  }

  const columns = [
    {
      title: 'S.No',
      key: 'sno',
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Bet Type',
      dataIndex: 'betType',
      key: 'betType',
    },
    {
      title: 'Board',
      dataIndex: 'board',
      key: 'board',
    },
    {
      title: 'Ticket Rate',
      dataIndex: 'ticket',
      key: 'ticket',
    },
    {
      title: 'Winning Amount',
      dataIndex: 'winningAmount',
      key: 'winningAmount',
    },
    {
      title: 'Triple Digit',
      dataIndex: 'tripleDigitMatching',
      key: 'tripleDigitMatching',
    },
    {
      title: 'Double Digit',
      dataIndex: 'doubleDigitMatching',
      key: 'doubleDigitMatching',
    },
    {
      title: 'Single Digit',
      dataIndex: 'singleDigitMatching',
      key: 'singleDigitMatching',
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Popconfirm
          title="Change Status"
          description={`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this game?`}
          onConfirm={() => handleToggleActive(record.id)}
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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Edit
          </Button>

          <Popconfirm
            title="Delete Game"
            description="Are you sure you want to delete this game?"
            onConfirm={() => confirmDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
        <h2>Board Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingGame(null)
            form.resetFields()
            setShowForm(true)
          }}
        >
          Add Game
        </Button>
      </div>

      <div style={{
        width: '100%',
        overflowX: 'scroll',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        border: '1px solid #d9d9d9',
        borderRadius: '6px',
        margin: '0 0.5rem'
      }}>
        <div style={{ minWidth: '1000px' }}>
          <Table
            columns={columns}
            dataSource={games}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={false}
            size="small"
          />
        </div>
      </div>

      <Modal
        title={editingGame ? 'Edit Game' : 'Add Game'}
        open={showForm}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            betType: 'SINGLE',
            singleDigitMatching: 0,
            doubleDigitMatching: 0,
            tripleDigitMatching: 0
          }}
        >
          <Form.Item
            label="Bet Type"
            name="betType"
            rules={[{ required: true, message: 'Please select bet type!' }]}
          >
            <Select>
              <Option value="SINGLE">Single</Option>
              <Option value="DOUBLE">Double</Option>
              <Option value="TRIPLE_DIGIT">Triple Digit</Option>
              <Option value="FOUR_DIGIT">Four Digit</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Board"
            name="board"
            rules={[{ required: true, message: 'Please input board!' }]}
          >
            <Input placeholder="e.g., A,B,C,D" />
          </Form.Item>
          
          <Form.Item
            label="Ticket Rate"
            name="ticket"
            rules={[{ required: true, message: 'Please input ticket rate!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          
          <Form.Item
            label="Winning Amount"
            name="winningAmount"
            rules={[{ required: true, message: 'Please input winning amount!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            label="Triple Digit Matching"
            name="tripleDigitMatching"
            rules={[{ required: true, message: 'Please input triple digit matching!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          
          <Form.Item
            label="Double Digit Matching"
            name="doubleDigitMatching"
            rules={[{ required: true, message: 'Please input double digit matching!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          
          <Form.Item
            label="Single Digit Matching"
            name="singleDigitMatching"
            rules={[{ required: true, message: 'Please input single digit matching!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingGame ? 'Update Game' : 'Create Game'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Games