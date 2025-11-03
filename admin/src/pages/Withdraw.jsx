import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Table, Tag, Input, Button } from 'antd';
import { getWithdraw, updateWithdrawStatus } from "../api/withdraw";
import { useMediaQuery } from 'react-responsive';

const Withdraw = () => {
  const [withdrawData, setWithdrawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  useEffect(() => {
    const fetchWithdrawData = async () => {
      try {
        const response = await getWithdraw();
        if (response.success) {
          setWithdrawData(response.data);
        }
      } catch (error) {
        console.error("Error fetching withdraw data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawData();
  }, []);

  const updatedWithdrawStatus = async (id, ticket) => {
    try {
      const response = await updateWithdrawStatus(id, ticket);
      if (response.success) {
        const status = ticket === 0 ? 'MISMATCH' : 'COMPLETED';
        const updatedData = withdrawData.map((withdraw) =>
          withdraw.id === id ? { ...withdraw, status, ticket, referenceNumber: response.data?.referenceNumber } : withdraw
        );
        setWithdrawData(updatedData);
      }
    } catch (error) {
      console.error("Error updating withdraw status:", error);
    }
  };

  const columns = [
    {
      title: 'User Type',
      key: 'userType',
      width: 100,
      render: (record) => record.playerId ? 'Player' : 'Agent',
    },
    {
      title: 'Username',
      key: 'username',
      width: 120,
      render: (record) => record.player?.username || record.agent?.username || 'N/A',
    },

    {
      title: 'Transfer Type',
      dataIndex: 'transferType',
      key: 'transferType',
      width: 120,
      render: (type) => type === 'BANK_TRANSFER' ? 'Bank Transfer' : 'UPI Transfer',
    },
    {
      title: 'Transfer Details',
      key: 'transferDetails',
      width: 200,
      render: (record) => {
        const details = record.transferDetails;
        return (
          <div>
            <div><strong>Name:</strong> {record.name || 'N/A'}</div>
            <div><strong>Phone:</strong> {record.phone || 'N/A'}</div>
            {record.transferType === 'BANK_TRANSFER' ? (
              <>
                <div><strong>Bank:</strong> {details?.bankName || 'N/A'}</div>
                <div><strong>Account:</strong> {details?.accountNumber || 'N/A'}</div>
                <div><strong>IFSC:</strong> {details?.ifscCode || 'N/A'}</div>
                <div><strong>Holder:</strong> {details?.accountHolderName || 'N/A'}</div>
              </>
            ) : (
              <>
                <div><strong>UPI ID:</strong> {details?.upiId || 'N/A'}</div>
                <div><strong>App:</strong> {details?.upiAppName ? (details.upiAppName === 'GOOGLE_PAY' ? 'Google Pay' : 'PhonePe') : 'N/A'}</div>
              </>
            )}
          </div>
        );
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      render: (amount) => `₹${amount}`,
    },
    {
      title: 'Screenshot',
      dataIndex: 'screenshot',
      key: 'screenshot',
      width: 120,
      render: (screenshot) => {
        if (screenshot) {
          const imageUrl = screenshot.startsWith('http') ? screenshot : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4020'}/uploads/${screenshot}`;
          return (
            <a href={imageUrl} target="_blank" rel="noopener noreferrer">
              View Screenshot
            </a>
          );
        }
        return 'No Screenshot';
      },
    },
    {
      title: 'Withdraw Amount',
      dataIndex: 'ticket',
      key: 'ticket',
      width: 150,
      render: (ticket, record) => {
        if (record.status === 'PENDING') {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Input.Group compact style={{ display: 'flex', width: '100%' }}>
                <Input
                  style={{ flex: 1, minWidth: '80px' }}
                  placeholder="Amount"
                  type="number"
                  min="1"
                  step="1"
                  size="small"
                  id={`ticket-${record.id}`}
                  defaultValue={record.amount}
                  disabled
                />
                <Button
                  type="primary"
                  size="small"
                  onClick={() => {
                    const inputValue = document.getElementById(`ticket-${record.id}`).value;
                    const ticketValue = parseInt(inputValue);
                    if (ticketValue > 0 && Number.isInteger(ticketValue)) {
                      updatedWithdrawStatus(record.id, ticketValue);
                    }
                  }}
                >
                  ADD
                </Button>
              </Input.Group>
              <Button
                type="default"
                danger
                size="small"
                style={{ width: '100%' }}
                onClick={() => {
                  updatedWithdrawStatus(record.id, 0);
                }}
              >
                MISMATCH
              </Button>
            </div>
          );
        }
        return ticket !== null ? `₹${ticket}` : 'N/A';
      },
    },
    {
      title: 'Reference Number',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      width: 150,
      render: (referenceNumber) => referenceNumber || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const color = status === 'PENDING' ? 'orange' : status === 'COMPLETED' ? 'green' : status === 'MISMATCH' ? 'red' : 'volcano';
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
        <h2>Withdraw Management</h2>
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
          dataSource={withdrawData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          size="small"
        />
      </div>
    </div>
  );
};

export default Withdraw;