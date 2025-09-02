import { useEffect, useState } from "react";
import { Table } from 'antd';
import { playerAPI } from "../api/player";

const Users = () => {
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  
      useEffect(() => {
          fetchPlayers()
        }, [])
      
        const fetchPlayers = async () => {
          try {
            const data = await playerAPI.getAll()
            setAllPlayers(data)
          } catch (error) {
            console.error('Error fetching all players:', error)
          } finally {
            setLoading(false)
          }
        }
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Referal Code',
      dataIndex: 'referalCode',
      key: 'referalCode',
      render: (code) => code || 'N/A',
    },
    {
      title: 'Wallet Balance',
      key: 'balance',
      render: (record) => `₹${record.wallet?.balance || 0}`,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ]

  return (
    <div className="users-section">
      <div className="section-header">
        <h2>Player Management</h2>
      </div>
      
      <Table
        columns={columns}
        dataSource={allPlayers}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        scroll={{ x: 800 }}
      />
    </div>
  )
}

export default Users