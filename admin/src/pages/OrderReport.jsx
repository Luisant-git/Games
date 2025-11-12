import { useState, useEffect } from 'react'
import { Table, Input, Button, Select, Space } from 'antd'
import { SearchOutlined, WhatsAppOutlined, ReloadOutlined } from '@ant-design/icons'
import { getOrderReport, getWhatsAppFormat, getShowtimes } from '../api/orderReport'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const { Option } = Select

export default function OrderReport() {
  const [data, setData] = useState([])
  const [showTimes, setShowTimes] = useState([])
  const [filters, setFilters] = useState({ 
    showtimeId: null,
    board: '', 
    qty: '' 
  })
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, current: 1, pageSize: 10 })

  useEffect(() => {
    fetchShowTimes()
  }, [])

  const fetchShowTimes = async () => {
    try {
      const result = await getShowtimes()
      setShowTimes(result)
    } catch (error) {
      toast.error('Failed to fetch showtimes')
    }
  }

  const [metadata, setMetadata] = useState(null)

  const fetchData = async (filterParams = {}) => {
    setLoading(true)
    try {
      const result = await getOrderReport(filterParams)
      setData(result.data || result)
      setMetadata(result.metadata || null)
      if (result.pagination) {
        setPagination({
          total: result.pagination.total,
          current: result.pagination.page,
          pageSize: result.pagination.limit,
        })
      }
    } catch (error) {
      toast.error('Failed to fetch order report')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    const params = { page: 1, limit: pagination.pageSize, date: dayjs().format('YYYY-MM-DD') }
    if (filters.showtimeId) params.showtimeId = filters.showtimeId
    if (filters.board) params.board = filters.board
    if (filters.qty) params.qty = filters.qty
    fetchData(params)
  }

  const handleTableChange = (paginationInfo) => {
    const params = { page: paginationInfo.current, limit: paginationInfo.pageSize, date: dayjs().format('YYYY-MM-DD') }
    if (filters.showtimeId) params.showtimeId = filters.showtimeId
    if (filters.board) params.board = filters.board
    if (filters.qty) params.qty = filters.qty
    fetchData(params)
  }

  const handleWhatsAppShare = async () => {
    try {
      const params = { date: dayjs().format('YYYY-MM-DD') }
      if (filters.showtimeId) params.showtimeId = filters.showtimeId
      if (filters.board) params.board = filters.board
      if (filters.qty) params.qty = filters.qty
      const result = await getWhatsAppFormat(params)
      const message = encodeURIComponent(result.message)
      window.open(`https://wa.me/?text=${message}`, '_blank')
    } catch (error) {
      toast.error('Failed to generate WhatsApp message')
    }
  }

  const formatTime = (time) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  const formatNumber = (number) => {
    if (typeof number === 'string') {
      try {
        const parsed = JSON.parse(number)
        return Array.isArray(parsed) ? parsed.join('') : number
      } catch {
        return number
      }
    }
    return number
  }

  const columns = [
    { title: 'S.No', dataIndex: 'sno', key: 'sno', width: 80 },
    { title: 'Board Name', dataIndex: 'board', key: 'board', width: 120 },
    { title: 'Bet Number', dataIndex: 'number', key: 'number', width: 100, render: (number) => formatNumber(number) },
    { title: 'Qty', dataIndex: 'qty', key: 'qty', width: 80 },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 100, render: (amount) => `₹${amount}` },
  ]

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div className="section-header" style={{ padding: '0 0.5rem' }}>
        <h2>Order Report</h2>
      </div>
      
      <div style={{ marginBottom: 16, padding: '0 0.5rem' }}>
        <Space wrap>
          <Select
            placeholder="Select Showtime"
            value={filters.showtimeId}
            onChange={(value) => handleFilterChange('showtimeId', value)}
            style={{ width: 180 }}
            allowClear
          >
            {showTimes.map((st) => (
              <Option key={st.id} value={st.id}>
                {formatTime(st.showTime)} - {st.category}
              </Option>
            ))}
          </Select>

          <Input
            placeholder="Board"
            value={filters.board}
            onChange={(e) => handleFilterChange('board', e.target.value)}
            style={{ width: 120 }}
            prefix={<SearchOutlined />}
          />
          <Input
            placeholder="Quantity"
            type="number"
            value={filters.qty}
            onChange={(e) => handleFilterChange('qty', e.target.value)}
            style={{ width: 120 }}
          />
          <Button type="primary" onClick={handleSearch}>Search</Button>
          <Button type="primary" icon={<WhatsAppOutlined />} style={{ backgroundColor: '#25D366' }} onClick={handleWhatsAppShare}>
            Share
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleSearch}></Button>
          <Button onClick={() => { setFilters({ showtimeId: null, board: '', qty: '' }); fetchData(); }}>Clear</Button>
        </Space>
      </div>

      <div>
        {metadata && (
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', marginLeft: '8px', marginBottom: '5px' }}>
            <span style={{ marginRight: '20px' }}><strong>Category:</strong> {metadata.category}</span>
            <span style={{ marginRight: '20px' }}><strong>Showtime:</strong> {formatTime(metadata.showtime)}</span>
            <span><strong>Date:</strong> {formatDate(metadata.date)}</span>
          </div>
        )}
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
          rowKey="sno"
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
    </div>
  )
}