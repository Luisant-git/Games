import { useState, useEffect } from 'react'
import { Table, Input, Button, Select, Space, Checkbox } from 'antd'
import { SearchOutlined, WhatsAppOutlined, ReloadOutlined } from '@ant-design/icons'
import { getOrderReport, getWhatsAppFormat, getShowtimes } from '../api/orderReport'
import { gamesAPI } from '../api/games'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const { Option } = Select

export default function OrderReport() {
  const [data, setData] = useState([])
  const [showTimes, setShowTimes] = useState([])
  const [games, setGames] = useState([])
  const [filters, setFilters] = useState({ 
    showtimeId: null,
    board: '', 
    qty: '',
    betNumber: '' 
  })
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, current: 1, pageSize: 10 })
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  useEffect(() => {
    fetchShowTimes()
    fetchGames()
  }, [])

  const fetchShowTimes = async () => {
    try {
      const result = await getShowtimes()
      setShowTimes(result)
    } catch (error) {
      toast.error('Failed to fetch showtimes')
    }
  }

  const fetchGames = async () => {
    try {
      const result = await gamesAPI.getAll()
      const uniqueBoards = [...new Set(result.map(game => game.board))]
      setGames(uniqueBoards)
    } catch (error) {
      toast.error('Failed to fetch games')
    }
  }

  const [metadata, setMetadata] = useState(null)
  const [totalAmount, setTotalAmount] = useState(0)

  const fetchData = async (filterParams = {}) => {
    setLoading(true)
    try {
      const result = await getOrderReport(filterParams)
      setData(result.data || result)
      setMetadata(result.metadata || null)
      setTotalAmount(result.totalAmount || 0)
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
    if (filters.betNumber) params.betNumber = filters.betNumber
    fetchData(params)
  }

  const handleTableChange = (paginationInfo) => {
    const params = { page: paginationInfo.current, limit: paginationInfo.pageSize, date: dayjs().format('YYYY-MM-DD') }
    if (filters.showtimeId) params.showtimeId = filters.showtimeId
    if (filters.board) params.board = filters.board
    if (filters.qty) params.qty = filters.qty
    if (filters.betNumber) params.betNumber = filters.betNumber
    fetchData(params)
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([])
      setSelectAll(false)
    } else {
      setSelectedRows(data.map(item => item.sno))
      setSelectAll(true)
    }
  }

  const handleRowSelect = (sno) => {
    setSelectedRows(prev => {
      if (prev.includes(sno)) {
        const newSelected = prev.filter(id => id !== sno)
        setSelectAll(newSelected.length === data.length && data.length > 0)
        return newSelected
      } else {
        const newSelected = [...prev, sno]
        setSelectAll(newSelected.length === data.length && data.length > 0)
        return newSelected
      }
    })
  }

  const handleWhatsAppShare = async () => {
    try {
      if (selectedRows.length === 0) {
        toast.error('Please select at least one order to share')
        return
      }
      
      const params = { date: dayjs().format('YYYY-MM-DD') }
      if (filters.showtimeId) params.showtimeId = filters.showtimeId
      if (filters.board) params.board = filters.board
      if (filters.qty) params.qty = filters.qty
      if (filters.betNumber) params.betNumber = filters.betNumber
      
      const result = await getWhatsAppFormat(params, selectedRows, selectAll)
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
    { 
      title: <><Checkbox checked={selectAll} onChange={handleSelectAll} /> S.No</>, 
      dataIndex: 'sno', 
      key: 'sno', 
      width: 100,
      render: (sno, record) => (
        <>
          <Checkbox 
            checked={selectedRows.includes(record.sno)} 
            onChange={() => handleRowSelect(record.sno)}
          />
          {' '}{sno}
        </>
      )
    },
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

          <Select
            placeholder="Board"
            value={filters.board || undefined}
            onChange={(value) => handleFilterChange('board', value)}
            style={{ width: 120 }}
            allowClear
          >
            {games.map((board) => (
              <Option key={board} value={board}>
                {board}
              </Option>
            ))}
          </Select>
          <Input
            placeholder="Quantity"
            type="number"
            value={filters.qty}
            onChange={(e) => handleFilterChange('qty', e.target.value)}
            style={{ width: 110 }}
          />
          <Input
            placeholder="Bet Number"
            value={filters.betNumber}
            onChange={(e) => handleFilterChange('betNumber', e.target.value)}
            style={{ width: 120 }}
          />
          <Button type="primary" onClick={handleSearch}>Search</Button>
          <Button 
            type="primary" 
            icon={<WhatsAppOutlined />} 
            style={{ backgroundColor: '#25D366' }} 
            onClick={handleWhatsAppShare}
            disabled={selectedRows.length === 0}
          >
            Share Selected ({selectedRows.length})
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleSearch}></Button>
          <Button onClick={() => { setFilters({ showtimeId: null, board: '', qty: '', betNumber: '' }); setSelectedRows([]); setSelectAll(false); fetchData(); }}>Clear</Button>
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

      {totalAmount > 0 && (
        <div style={{ padding: '10px 0.5rem', fontSize: '16px', fontWeight: 'bold', textAlign: 'right' }}>
          Total Amount: ₹{totalAmount}
        </div>
      )}
    </div>
  )
}