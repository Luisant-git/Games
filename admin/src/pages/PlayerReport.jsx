import { useState, useEffect } from 'react'
import { Table, DatePicker, Button, Space, Select, Modal } from 'antd'
import { SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { getPlayerReport } from '../api/playerReport'
import { categoryAPI } from '../api/category'
import { getShowtimes } from '../api/orderReport'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

export default function PlayerReport() {
  const [data, setData] = useState([])
  const [categories, setCategories] = useState([])
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedGames, setSelectedGames] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [filters, setFilters] = useState({
    categoryId: null,
    showtimeId: null,
    fromDate: dayjs().format('YYYY-MM-DD'),
    toDate: dayjs().format('YYYY-MM-DD'),
  })

  useEffect(() => {
    fetchCategories()
    fetchShowtimes()
    handleSearch()
  }, [])

  const fetchCategories = async () => {
    try {
      const result = await categoryAPI.getAll()
      setCategories(Array.isArray(result.categories) ? result.categories : [])
    } catch (error) {
      toast.error('Failed to fetch categories')
      setCategories([])
    }
  }

  const fetchShowtimes = async () => {
    try {
      const result = await getShowtimes()
      setShowtimes(Array.isArray(result) ? result : [])
    } catch (error) {
      toast.error('Failed to fetch showtimes')
      setShowtimes([])
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      const result = await getPlayerReport(filters)
      setData(Array.isArray(result) ? result : [])
    } catch (error) {
      toast.error('Failed to fetch player report')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
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

  const handleSeeMore = (record) => {
    const gameData = record.games?.map((game, index) => ({
      sno: index + 1,
      ...game,
    })) || []
    setSelectedGames(gameData)
    setSelectedPlayer(record.playerName)
    setModalVisible(true)
  }

  const gameColumns = [
    { title: 'S.No', dataIndex: 'sno', key: 'sno', width: 60 },
    { title: 'Board Name', dataIndex: 'boardName', key: 'boardName', width: 120 },
    { title: 'Number', dataIndex: 'number', key: 'number', width: 100 },
    { title: 'Qty', dataIndex: 'qty', key: 'qty', width: 80 },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 100, render: (amt) => `₹${amt}` },
    { title: 'Winning Amount', dataIndex: 'winningAmount', key: 'winningAmount', width: 140, render: (amt) => `₹${amt}` },
  ]

  const columns = [
    { title: 'S.No', dataIndex: 'sno', key: 'sno', width: 60 },
    { title: 'Player Name', dataIndex: 'playerName', key: 'playerName', width: 150 },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 100 },
    { title: 'Show Date', dataIndex: 'showDate', key: 'showDate', width: 120, render: (date) => formatDate(date) },
    { title: 'Showtime', dataIndex: 'showtime', key: 'showtime', width: 100, render: (time) => formatTime(time) },
    { title: 'Entries', dataIndex: 'entries', key: 'entries', width: 80 },
    { title: 'Total Amount', dataIndex: 'totalAmount', key: 'totalAmount', width: 120, render: (amt) => `₹${amt}` },
    { title: 'Winning Amount', dataIndex: 'winningAmount', key: 'winningAmount', width: 140, render: (amt) => `₹${amt}` },
    { title: 'Balance', dataIndex: 'balance', key: 'balance', width: 120, render: (amt) => `₹${amt.toFixed(2)}` },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleSeeMore(record)}
          disabled={!record.games || record.games.length === 0}
        >
          See More
        </Button>
      ),
    },
  ]

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div className="section-header" style={{ padding: '0 0.5rem' }}>
        <h2>Player Report</h2>
      </div>

      <div style={{ marginBottom: 16, padding: '0 0.5rem' }}>
        <Space wrap>
          <Select
            placeholder="Select Category"
            value={filters.categoryId}
            onChange={(value) => handleFilterChange('categoryId', value)}
            style={{ width: 150 }}
            allowClear
          >
            {Array.isArray(categories) && categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Select Showtime"
            value={filters.showtimeId}
            onChange={(value) => handleFilterChange('showtimeId', value)}
            style={{ width: 180 }}
            allowClear
          >
            {Array.isArray(showtimes) && showtimes.map((st) => (
              <Option key={st.id} value={st.id}>
                {formatTime(st.showTime)} - {st.category}
              </Option>
            ))}
          </Select>
          <RangePicker
            value={[dayjs(filters.fromDate), dayjs(filters.toDate)]}
            onChange={(dates) => {
              if (dates) {
                handleFilterChange('fromDate', dates[0].format('YYYY-MM-DD'))
                handleFilterChange('toDate', dates[1].format('YYYY-MM-DD'))
              }
            }}
            format="DD-MM-YYYY"
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            Search
          </Button>
        </Space>
      </div>

      <div style={{ padding: '0 0.5rem' }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="sno"
          loading={loading}
          scroll={{ x: 1200 }}
          size="small"
        />
      </div>

      <Modal
        title={`Games Played by ${selectedPlayer}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={gameColumns}
          dataSource={selectedGames}
          rowKey="sno"
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  )
}