import { useState, useEffect } from 'react'
import { Table, Select, Modal } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { getAllSupport, updateSupportStatus } from '../api/support'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const { Option } = Select

export default function Enquiry() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, current: 1, pageSize: 10 })
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    fetchData(1, 10)
  }, [])

  const fetchData = async (page, limit) => {
    setLoading(true)
    try {
      const result = await getAllSupport(page, limit)
      setData(result.data)
      setPagination({
        total: result.pagination.total,
        current: result.pagination.page,
        pageSize: result.pagination.limit,
      })
    } catch (error) {
      toast.error('Failed to fetch support tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleTableChange = (paginationInfo) => {
    fetchData(paginationInfo.current, paginationInfo.pageSize)
  }

  const handleStatusChange = async (id, status) => {
    try {
      await updateSupportStatus(id, status)
      toast.success('Status updated successfully')
      fetchData(pagination.current, pagination.pageSize)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const showModal = (record) => {
    setSelectedRecord(record)
    setModalVisible(true)
  }

  const columns = [
    { 
      title: 'S.No', 
      key: 'sno', 
      width: 80,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1
    },
    { 
      title: 'User', 
      key: 'user', 
      width: 150,
      render: (record) => record.player?.username || record.agent?.username || 'N/A'
    },
    { 
      title: 'User Type', 
      key: 'userType', 
      width: 100,
      render: (record) => record.playerId ? 'Player' : 'Agent'
    },
    { title: 'Subject', dataIndex: 'subject', key: 'subject', width: 200 },
    { 
      title: 'Message', 
      dataIndex: 'message', 
      key: 'message',
      width: 150,
      render: (text) => text?.length > 12 ? `${text.substring(0, 12)}...` : text
    },
    { 
      title: 'Image', 
      dataIndex: 'image', 
      key: 'image',
      width: 80,
      render: (image) => image ? (
        <img 
          src={image} 
          alt="Ticket" 
          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
          onClick={() => window.open(image, '_blank')}
        />
      ) : 'N/A'
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      width: 150,
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: '100%' }}
        >
          <Option value="OPEN">Open</Option>
          <Option value="IN_PROGRESS">In Progress</Option>
          <Option value="RESOLVED">Resolved</Option>
          <Option value="CLOSED">Closed</Option>
        </Select>
      )
    },
    { 
      title: 'Created At', 
      dataIndex: 'createdAt', 
      key: 'createdAt', 
      width: 150,
      render: (date) => dayjs(date).format('DD-MM-YYYY HH:mm')
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <EyeOutlined 
          onClick={() => showModal(record)} 
          style={{ cursor: 'pointer', fontSize: '18px', color: '#1890ff' }}
        />
      )
    },
  ]

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div className="section-header" style={{ padding: '0 0.5rem' }}>
        <h2>Support Enquiries</h2>
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
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          onChange={handleTableChange}
          size="small"
        />
      </div>

      <Modal
        title="Enquiry Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <div>
            <p><strong>User:</strong> {selectedRecord.player?.username || selectedRecord.agent?.username || 'N/A'}</p>
            <p><strong>User Type:</strong> {selectedRecord.playerId ? 'Player' : 'Agent'}</p>
            <p><strong>Subject:</strong> {selectedRecord.subject}</p>
            <p><strong>Message:</strong> {selectedRecord.message}</p>
            <p><strong>Status:</strong> {selectedRecord.status}</p>
            <p><strong>Created At:</strong> {dayjs(selectedRecord.createdAt).format('DD-MM-YYYY HH:mm')}</p>
            {selectedRecord.image && (
              <div style={{ marginTop: '16px' }}>
                <p><strong>Attached Image:</strong></p>
                <img 
                  src={selectedRecord.image} 
                  alt="Support ticket" 
                  style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid #d9d9d9', cursor: 'pointer' }}
                  onClick={() => window.open(selectedRecord.image, '_blank')}
                  title="Click to view full screen"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
