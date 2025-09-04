import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Table, Tag, Input, Button } from 'antd';
import { getDeposit, updateDepositStatus } from "../api/deposit";
import { useMediaQuery } from 'react-responsive';

const Deposit = () => {
  const [depositData, setDepositData] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 768 });
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
      fixed: isMobile ? false : 'left',
    },
    {
      title: 'Player',
      key: 'player',
      width: 120,
      render: (record) => record.player?.name || 'N/A',
    },
    {
      title: 'Player Email',
      key: 'playerEmail',
      width: 180,
      render: (record) => record.player?.email || 'N/A',
    },
    {
      title: 'UTR Number',
      dataIndex: 'utrNumber',
      key: 'utrNumber',
      width: 120,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
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
      width: 100,
      render: (status) => {
        const color = status === 'PENDING' ? 'orange' : status === 'COMPLETED' ? 'green' : status === 'CANCELLED' ? 'red' : 'volcano';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div className="section-header" style={{ padding: '0 0.5rem' }}>
        <h2>Deposit Management</h2>
      </div>
      
      <div style={{
        width: '100%',
        overflowX: 'scroll',
        overflowY: 'hidden',
        WebkitOverflowScrolling: 'touch',
        border: '1px solid #d9d9d9',
        borderRadius: '6px',
        margin: '0 0.5rem'
      }}>
        <div style={{ minWidth: '800px' }}>
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
            scroll={false}
            size="small"
          />
        </div>
      </div>
    </div>
  );
};

export default Deposit;
