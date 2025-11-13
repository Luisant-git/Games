import { useState, useEffect } from 'react'
import { Table, DatePicker, Button, Space, Modal } from 'antd'
import { SearchOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons'
import { getSummaryReport } from '../api/summaryReport'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function SummaryReport() {
  const [summaryData, setSummaryData] = useState([])
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState([dayjs(), dayjs()])
  const [agentModalVisible, setAgentModalVisible] = useState(false)
  const [winningModalVisible, setWinningModalVisible] = useState(false)
  const [selectedAgentData, setSelectedAgentData] = useState([])
  const [selectedWinningData, setSelectedWinningData] = useState([])

  useEffect(() => {
    handleSearch()
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    try {
      const params = {
        fromDate: dateRange[0].format('YYYY-MM-DD'),
        toDate: dateRange[1].format('YYYY-MM-DD'),
      }
      const summary = await getSummaryReport(params)
      setSummaryData(summary)
    } catch (error) {
      toast.error('Failed to fetch reports')
    } finally {
      setLoading(false)
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

  const summaryColumns = [
    { title: 'S.No', dataIndex: 'sno', key: 'sno', width: 60 },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 100 },
    { title: 'Show Date', dataIndex: 'showDate', key: 'showDate', width: 120, render: (date) => formatDate(date) },
    { title: 'Showtime', dataIndex: 'showtime', key: 'showtime', width: 100, render: (time) => formatTime(time) },
    { title: 'Entries', dataIndex: 'entries', key: 'entries', width: 80 },
    { title: 'Total Amount', dataIndex: 'totalAmount', key: 'totalAmount', width: 120, render: (amt) => `₹${amt}` },
    { title: 'Commission', dataIndex: 'commission', key: 'commission', width: 120, render: (amt) => `₹${amt.toFixed(2)}` },
    { title: 'Balance', dataIndex: 'balance', key: 'balance', width: 120, render: (amt) => `₹${amt.toFixed(2)}` },
    { title: 'Winning No', dataIndex: 'winningNo', key: 'winningNo', width: 100 },
    { title: 'Winning Amount', dataIndex: 'winningAmount', key: 'winningAmount', width: 140, render: (amt) => `₹${amt}` },
    { title: 'Profit', dataIndex: 'profit', key: 'profit', width: 120, render: (amt) => `₹${amt.toFixed(2)}` },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<TeamOutlined />}
            onClick={() => {
              setSelectedAgentData(record.agentReport)
              setAgentModalVisible(true)
            }}
          >
            Agent
          </Button>
          <Button
            size="small"
            icon={<TrophyOutlined />}
            onClick={() => {
              setSelectedWinningData(record.winningReport)
              setWinningModalVisible(true)
            }}
          >
            Winning
          </Button>
        </Space>
      ),
    },
  ]

  const agentColumns = [
    { title: 'S.No', dataIndex: 'sno', key: 'sno', width: 60 },
    { title: 'Agent Name', dataIndex: 'agentName', key: 'agentName', width: 150 },
    { title: 'Entries', dataIndex: 'entries', key: 'entries', width: 80 },
    { title: 'Total Amount', dataIndex: 'totalAmount', key: 'totalAmount', width: 120, render: (amt) => `₹${amt}` },
    { title: 'Commission', dataIndex: 'commission', key: 'commission', width: 120, render: (amt) => `₹${amt.toFixed(2)}` },
    { title: 'Balance', dataIndex: 'balance', key: 'balance', width: 120, render: (amt) => `₹${amt.toFixed(2)}` },
    { title: 'Winning Amount', dataIndex: 'winningAmount', key: 'winningAmount', width: 140, render: (amt) => `₹${amt}` },
    { title: 'Profit', dataIndex: 'profit', key: 'profit', width: 120, render: (amt) => `₹${amt.toFixed(2)}` },
  ]

  const winningColumns = [
    { title: 'S.No', dataIndex: 'sno', key: 'sno', width: 60 },
    { title: 'Username', dataIndex: 'username', key: 'username', width: 120 },
    { title: 'User Type', dataIndex: 'userType', key: 'userType', width: 100 },
    { title: 'Board Name', dataIndex: 'boardName', key: 'boardName', width: 120 },
    { title: 'Number', dataIndex: 'number', key: 'number', width: 100 },
    { title: 'Qty', dataIndex: 'qty', key: 'qty', width: 80 },
    { title: 'Rate', dataIndex: 'rate', key: 'rate', width: 100, render: (amt) => `₹${amt}` },
    { title: 'Total Amount', dataIndex: 'totalAmount', key: 'totalAmount', width: 120, render: (amt) => `₹${amt}` },
    { title: 'Winning Amount', dataIndex: 'winningAmount', key: 'winningAmount', width: 140, render: (amt) => `₹${amt}` },
  ]

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div className="section-header" style={{ padding: '0 0.5rem' }}>
        <h2>Summary Report</h2>
      </div>

      <div style={{ marginBottom: 16, padding: '0 0.5rem' }}>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates || [dayjs(), dayjs()])}
            format="DD-MM-YYYY"
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            Search
          </Button>
        </Space>
      </div>

      <Table
        columns={summaryColumns}
        dataSource={summaryData}
        rowKey="sno"
        loading={loading}
        scroll={{ x: 1400 }}
        size="small"
        style={{ padding: '0 0.5rem' }}
      />

      <Modal
        title="Agent Report"
        open={agentModalVisible}
        onCancel={() => setAgentModalVisible(false)}
        footer={null}
        width={900}
      >
        <Table
          columns={agentColumns}
          dataSource={selectedAgentData}
          rowKey="sno"
          pagination={false}
          size="small"
        />
      </Modal>

      <Modal
        title="Winning Result"
        open={winningModalVisible}
        onCancel={() => setWinningModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Table
          columns={winningColumns}
          dataSource={selectedWinningData}
          rowKey="sno"
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  )
}