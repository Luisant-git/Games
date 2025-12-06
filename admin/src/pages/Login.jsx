import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Form, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { loginAdmin } from '../api/auth'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const result = await loginAdmin(values.username, values.password)
      localStorage.setItem('adminToken', result.access_token)
      message.success('Login successful!')
      navigate('/category')
    } catch (error) {
      message.error('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card
        title="Admin Login"
        style={{
          width: 400,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              Login
            </Button>
          </Form.Item>
        </Form>
        

      </Card>
    </div>
  )
}

export default Login