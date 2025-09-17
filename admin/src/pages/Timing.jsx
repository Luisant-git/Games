import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, DatePicker, Card } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { timingAPI } from '../api/timing'
import { categoryAPI } from '../api/category'
import { useMediaQuery } from 'react-responsive'

const Timing = () => {
  const [timings, setTimings] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTiming, setEditingTiming] = useState(null)
  const [form] = Form.useForm()
  const isMobile = useMediaQuery({ maxWidth: 1024 })
  console.log(categories, "<--- categories-time");
  
  const formatTimeToAMPM = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [timingsData, categoriesData] = await Promise.all([
        timingAPI.getAll(),
        categoryAPI.getAll()
      ])
      setTimings(Array.isArray(timingsData) ? timingsData : [])
      setCategories(categoriesData?.categories || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setTimings([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    try {
      const submitData = {
        ...values,
        categoryId: parseInt(values.categoryId),
        showTimes: values.showTimes.map(st => ({
          playStart: st.playStart,
          playEnd: st.playEnd,
          showTime: st.showTime
        }))
      }
      
      if (editingTiming) {
        await timingAPI.update(editingTiming.id, submitData)
      } else {
        await timingAPI.create(submitData)
      }
      fetchData()
      handleCancel()
    } catch (error) {
      console.error('Error saving timing:', error)
    }
  }

  const handleEdit = (timing) => {
    setEditingTiming(timing)
    form.setFieldsValue({
      categoryId: timing.categoryId,
      showTimes: timing.showTimes.map(st => ({
        playStart: st.playStart,
        playEnd: st.playEnd,
        showTime: st.showTime
      }))
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await timingAPI.delete(id)
      fetchData()
    } catch (error) {
      console.error('Error deleting timing:', error)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setEditingTiming(null)
    form.resetFields()
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },

    {
      title: 'Category',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: 'Show Times',
      dataIndex: 'showTimes',
      key: 'showTimes',
      render: (showTimes) => (
        <div>
          {showTimes?.map((st, i) => (
            <div key={i}>
              Show: {formatTimeToAMPM(st.showTime)}<br/>
              Play: {formatTimeToAMPM(st.playStart)} - {formatTimeToAMPM(st.playEnd)}
            </div>
          ))}
        </div>
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
            title="Delete Timing"
            description="Are you sure you want to delete this timing?"
            onConfirm={() => handleDelete(record.id)}
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
        <h2>Timing Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Timing
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
        <div style={{ minWidth: '800px' }}>
          <Table
            columns={columns}
            dataSource={timings}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={false}
            size="small"
          />
        </div>
      </div>

      <Modal
        title={editingTiming ? 'Edit Timing' : 'Add Timing'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={isMobile ? '95vw' : 600}
        style={isMobile ? { top: 20 } : {}}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            showTimes: [{ playStart: null, playEnd: null, showTime: null }]
          }}
        >

          <Form.Item
            label="Category"
            name="categoryId"
            rules={[{ required: true, message: 'Please select a category!' }]}
          >
            <Select placeholder="Select Category">
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.List name="showTimes">
            {(fields, { add, remove }) => (
              <>
                <Form.Item label="Show Times">
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" style={{ marginBottom: 8 }}>
                      <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: isMobile ? 'none' : '1fr 1fr 1fr', gap: '8px', alignItems: 'start' }}>

                        <Form.Item
                          {...restField}
                          name={[name, 'playStart']}
                          rules={[{ required: true, message: 'Missing play start time' }]}
                          label="Play Start"
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            type="time"
                            placeholder="Play Start Time"
                            style={{ width: '100%', fontSize: isMobile ? '16px' : '14px' }}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'playEnd']}
                          rules={[{ required: true, message: 'Missing play end time' }]}
                          label="Play End"
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            type="time"
                            placeholder="Play End Time"
                            style={{ width: '100%', fontSize: isMobile ? '16px' : '14px' }}
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'showTime']}
                          rules={[{ required: true, message: 'Missing show time' }]}
                          label="Show Time"
                          style={{ marginBottom: 0 }}
                        >
                          <Input
                            type="time"
                            placeholder="Show Time"
                            style={{ width: '100%', fontSize: isMobile ? '16px' : '14px' }}
                          />
                        </Form.Item>
                        
                        {fields.length > 1 && (
                          <div style={{ textAlign: 'center' }}>
                            <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f', fontSize: '16px' }} />
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Show Time
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item>
            <Space>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTiming ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Timing