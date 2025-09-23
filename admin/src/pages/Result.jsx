import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getResults, createResult, publishResult } from '../api/result';

const Result = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const data = await getResults();
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const datetime = new Date(values.datetime);
      await createResult({
        date: datetime.toISOString().split('T')[0],
        time: datetime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        numbers: values.numbers
      });
      fetchResults();
      handleCancel();
    } catch (error) {
      console.error('Error creating result:', error);
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishResult(id);
      fetchResults();
    } catch (error) {
      console.error('Error publishing result:', error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Numbers',
      dataIndex: 'numbers',
      key: 'numbers',
    },
    {
      title: 'Board Results',
      key: 'boards',
      render: (_, record) => (
        <div>
          <div>A: {record.boards?.A} | B: {record.boards?.B} | C: {record.boards?.C}</div>
          <div>AB: {record.boards?.AB} | AC: {record.boards?.AC} | BC: {record.boards?.BC}</div>
          <div>ABC: {record.boards?.ABC}</div>
          <div>ABCD: {record.boards?.ABCD}</div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            onClick={() => handlePublish(record.id)}
          >
            Publish
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
        <h2>Results Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Result
        </Button>
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
          dataSource={results}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          size="small"
        />
      </div>

      <Modal
        title="Add Result"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Date & Time"
            name="datetime"
            rules={[{ required: true, message: 'Please select date and time!' }]}
          >
            <Input
              type="datetime-local"
              placeholder="Select Date & Time"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            label="Numbers (5 digits)"
            name="numbers"
            rules={[
              { required: true, message: 'Please input numbers!' },
              { len: 5, message: 'Must be exactly 5 digits!' },
              { pattern: /^[0-9]{5}$/, message: 'Must contain only digits!' }
            ]}
          >
            <Input placeholder="e.g., 27362" maxLength={5} />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Result;