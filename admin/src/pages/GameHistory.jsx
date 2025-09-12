import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Space, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getGameHistory } from '../api/gameHistory';
import { useMediaQuery } from 'react-responsive';

const { Option } = Select;

const GameHistory = () => {
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    board: '',
    quantity: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({ total: 0, current: 1, pageSize: 10 });
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    fetchGameHistory();
  }, [filters]);

  const fetchGameHistory = async () => {
    setLoading(true);
    try {
      const response = await getGameHistory(filters);
      if (response.success) {
        setGameHistory(response.data);
        setPagination({
          total: response.pagination.total,
          current: response.pagination.page,
          pageSize: response.pagination.limit
        });
      }
    } catch (error) {
      console.error('Error fetching game history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleTableChange = (paginationInfo) => {
    setFilters(prev => ({
      ...prev,
      page: paginationInfo.current,
      limit: paginationInfo.pageSize
    }));
  };

  const columns = [
    {
      title: 'Player ID',
      key: 'playerId',
      width: 80,
      render: (record) => record.player?.id || 'N/A',
    },
    {
      title: 'Player',
      key: 'player',
      width: 120,
      render: (record) => record.player?.username || 'N/A',
    },
    {
      title: 'Phone',
      key: 'phone',
      width: 120,
      render: (record) => record.player?.phone || 'N/A',
    },
    {
      title: 'Total Sessions',
      dataIndex: 'totalSessions',
      key: 'totalSessions',
      width: 100,
    },
    {
      title: 'Total Games',
      dataIndex: 'totalGames',
      key: 'totalGames',
      width: 100,
    },
    {
      title: 'Total Bet',
      dataIndex: 'totalBetAmount',
      key: 'totalBetAmount',
      width: 100,
      render: (amount) => `₹${amount}`,
    },
    // {
    //   title: 'Total Win',
    //   dataIndex: 'totalWinAmount',
    //   key: 'totalWinAmount',
    //   width: 100,
    //   render: (amount) => `₹${amount}`,
    // },
    {
      title: 'Last Played',
      dataIndex: 'lastPlayed',
      key: 'lastPlayed',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div className="section-header" style={{ padding: '0 0.5rem' }}>
        <h2>Game History</h2>
      </div>
      
      <div style={{ marginBottom: 16, padding: '0 0.5rem' }}>
        <Space wrap>
          <Input
            placeholder="Board name"
            value={filters.board}
            onChange={(e) => handleFilterChange('board', e.target.value)}
            style={{ width: 120 }}
            prefix={<SearchOutlined />}
          />
          <Input
            placeholder="Quantity"
            type="number"
            value={filters.quantity}
            onChange={(e) => handleFilterChange('quantity', e.target.value)}
            style={{ width: 120 }}
          />
          <Button onClick={() => setFilters({ board: '', quantity: '', page: 1, limit: 10 })}>
            Clear
          </Button>
        </Space>
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
          dataSource={gameHistory}
          rowKey={(record) => record.player.id}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          onChange={handleTableChange}
          size="small"
          expandable={{
            expandIcon: ({ expanded, onExpand, record }) => (
              <span
                onClick={(e) => onExpand(record, e)}
                style={{
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1890ff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#f0f8ff',
                  border: '1px solid #d9d9d9',
                  display: 'inline-block',
                  minWidth: '24px',
                  textAlign: 'center'
                }}
              >
                {expanded ? '−' : '+'}
              </span>
            ),
            expandedRowRender: (record) => {
              const gameplayColumns = [
                { title: 'Board', dataIndex: 'board', key: 'board', width: 80 },
                { title: 'Type', dataIndex: 'betType', key: 'betType', width: 120 },
                { title: 'Numbers', dataIndex: 'numbers', key: 'numbers', width: 100, render: (numbers) => {
                  try {
                    return JSON.parse(numbers).join('');
                  } catch {
                    return numbers;
                  }
                }},
                { title: 'Qty', dataIndex: 'qty', key: 'qty', width: 60 },
                { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 80, render: (amount) => `₹${amount}` },
                // { title: 'Win', dataIndex: 'winAmount', key: 'winAmount', width: 80, render: (amount) => `₹${amount}` }
              ];
              
              return (
                <Table
                  columns={gameplayColumns}
                  dataSource={record.gameplay}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  style={{ margin: '8px 0' }}
                />
              );
            },
            rowExpandable: (record) => record.gameplay && record.gameplay.length > 0,
          }}
        />
      </div>
    </div>
  );
};

export default GameHistory;