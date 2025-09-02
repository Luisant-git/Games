import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, Select, Space, Popconfirm, DatePicker, Card } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { timingAPI } from '../api/timing'
import { categoryAPI } from '../api/category'
import dayjs from 'dayjs'

const Timing = () => {
  const [timings, setTimings] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTiming, setEditingTiming] = useState(null)
  const [form] = Form.useForm()
  console.log(categories, "<--- categories-time");
  

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
          playStart: st.playStart.toDate(),
          playEnd: st.playEnd.toDate(),
          showTime: st.showTime.toDate()
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
      name: timing.name,
      categoryId: timing.categoryId,
      showTimes: timing.showTimes.map(st => ({
        playStart: dayjs(st.playStart),
        playEnd: dayjs(st.playEnd),
        showTime: dayjs(st.showTime)
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
      width: 80,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
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
              Show: {dayjs(st.showTime).format('HH:mm')}<br/>
              Play: {dayjs(st.playStart).format('HH:mm')} - {dayjs(st.playEnd).format('HH:mm')}
            </div>
          ))}
        </div>
      ),
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
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Timing Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Timing
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={timings}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingTiming ? 'Edit Timing' : 'Add Timing'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
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
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input timing name!' }]}
          >
            <Input />
          </Form.Item>
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
                      <Space align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, 'showTime']}
                          rules={[{ required: true, message: 'Missing show time' }]}
                          label="Show Time"
                        >
                          <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm"
                            placeholder="Show Time"
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'playStart']}
                          rules={[{ required: true, message: 'Missing play start time' }]}
                          label="Play Start"
                        >
                          <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm"
                            placeholder="Play Start Time"
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, 'playEnd']}
                          rules={[{ required: true, message: 'Missing play end time' }]}
                          label="Play End"
                        >
                          <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm"
                            placeholder="Play End Time"
                          />
                        </Form.Item>
                        
                        {fields.length > 1 && (
                          <MinusCircleOutlined onClick={() => remove(name)} />
                        )}
                      </Space>
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