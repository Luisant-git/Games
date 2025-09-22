import { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import { getHistoryShowTime } from "../api/HistoryShowTime";

const HistoryShowTime = () => {
  const [historyShowTime, setHistoryShowTime] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllGameHistory = async () => {
    try {
      const response = await getHistoryShowTime();
      if (response.success) {
        const formattedData = Object.entries(response.data).map(([showTime, games]) => ({
          key: showTime,
          showTime,
          totalGames: games.length,
          totalBetAmount: games.reduce((sum, game) => sum + game.totalBetAmount, 0),
          totalWinAmount: games.reduce((sum, game) => sum + game.totalWinAmount, 0),
          games
        }));
        setHistoryShowTime(formattedData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllGameHistory();
  }, []);

  const columns = [
    {
      title: 'Show Time',
      dataIndex: 'showTime',
      key: 'showTime',
      render: (showTime) => new Date(showTime).toLocaleString(),
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
    {
      title: 'Total Win',
      dataIndex: 'totalWinAmount',
      key: 'totalWinAmount',
      width: 100,
      render: (amount) => `₹${amount}`,
    },
  ];

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div className="section-header" style={{ padding: '0 0.5rem' }}>
        <h2>History Show Time</h2>
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
          dataSource={historyShowTime}
          rowKey="key"
          loading={loading}
          size="small"
          pagination={false}
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
              const gameColumns = [
                { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
                { title: 'Player ID', dataIndex: 'playerId', key: 'playerId', width: 80, render: (id) => id || 'N/A' },
                { title: 'Agent ID', dataIndex: 'agentId', key: 'agentId', width: 80, render: (id) => id || 'N/A' },
                { title: 'Category', dataIndex: 'categoryId', key: 'categoryId', width: 80 },
                { title: 'Bet Amount', dataIndex: 'totalBetAmount', key: 'totalBetAmount', width: 100, render: (amount) => `₹${amount}` },
                { title: 'Win Amount', dataIndex: 'totalWinAmount', key: 'totalWinAmount', width: 100, render: (amount) => `₹${amount}` },
                { title: 'Commission', dataIndex: 'agentCommission', key: 'agentCommission', width: 100, render: (amount) => `₹${amount}` },
                { title: 'Status', dataIndex: 'isWon', key: 'isWon', width: 80, render: (isWon) => (
                  <Tag color={isWon ? 'green' : 'red'}>{isWon ? 'Won' : 'Lost'}</Tag>
                )}
              ];
              
              return (
                <Table
                  columns={gameColumns}
                  dataSource={record.games}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  style={{ margin: '8px 0' }}
                  scroll={{ x: 600 }}
                />
              );
            },
            rowExpandable: (record) => record.games && record.games.length > 0,
          }}
          scroll={{ x: 400 }}
        />
      </div>
    </div>
  );
};

export default HistoryShowTime;
