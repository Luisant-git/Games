import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Table, Tag, Input, Button } from 'antd';
import { getDeposit, updateDepositStatus } from "../api/deposit";

const Deposit = () => {
  const [depositData, setDepositData] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log("deposit-data", depositData);

  useEffect(() => {
    const fetchDepositData = async () => {
      try {
        const response = await getDeposit();
        if (response.success) {
          setDepositData(response.data);
        }
      } catch (error) {
        console.error("Error fetching deposit data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepositData();
  }, []);

  const updatedDepositStatus = async (id, ticket) => {
    try {
      const response = await updateDepositStatus(id, ticket);
      if (response.success) {
        const status = ticket > 0 ? 'COMPLETED' : 'CANCELLED';
        const updatedData = depositData.map((deposit) =>
          deposit.id === id ? { ...deposit, status, ticket } : deposit
        );
        setDepositData(updatedData);
      }
    } catch (error) {
      console.error("Error updating deposit status:", error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Player',
      key: 'player',
      render: (record) => record.player?.name || 'N/A',
    },
    {
      title: 'Player Email',
      key: 'playerEmail',
      render: (record) => record.player?.email || 'N/A',
    },
    {
      title: 'UTR Number',
      dataIndex: 'utrNumber',
      key: 'utrNumber',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₹${amount}`,
    },
    {
      title: 'Ticket',
      dataIndex: 'ticket',
      key: 'ticket',
      width: 120,
      render: (ticket, record) => {
        if (record.status === 'PENDING') {
          return (
            <Input.Group compact style={{ display: 'flex', width: '100%' }}>
              <Input
                style={{ flex: 1, minWidth: '50px' }}
                placeholder="0"
                type="number"
                min="0"
                step="1"
                size="small"
                id={`ticket-${record.id}`}
              />
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  const inputValue = document.getElementById(`ticket-${record.id}`).value;
                  const ticketValue = inputValue === '' ? 0 : parseInt(inputValue);
                  if (ticketValue >= 0 && Number.isInteger(ticketValue)) {
                    updatedDepositStatus(record.id, ticketValue);
                  }
                }}
              >
                ADD
              </Button>
            </Input.Group>
          );
        }
        return ticket !== null ? ticket : 'N/A';
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'PENDING' ? 'orange' : status === 'COMPLETED' ? 'green' : status === 'CANCELLED' ? 'red' : 'volcano';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div className="content">
      <div className="section-header">
        <h2>Deposit Management</h2>
      </div>
      
      <Table
        columns={columns}
        dataSource={depositData}
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
  );
};

export default Deposit;
