import { useState, useEffect } from 'react'
import { Card, Descriptions, Avatar, Spin } from 'antd'
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, SafetyOutlined } from '@ant-design/icons'
import { getAdminProfile } from '../api/auth'
import toast from 'react-hot-toast'
import profile3 from '../assets/profile3.png'

export default function Profile() {
  const [adminInfo, setAdminInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await getAdminProfile()
      setAdminInfo(data)
    } catch (error) {
      toast.error('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!adminInfo) {
    return <div>No profile data available</div>
  }

  return (
    <div style={{ width: '100vw', marginLeft: '-1.5rem', marginRight: '-1.5rem', padding: '0 1rem' }}>
      <div className="section-header" style={{ padding: '0 0.5rem' }}>
        <h2>Profile</h2>
      </div>

      <div style={{ padding: '0 0.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Avatar size={120} src={profile3} icon={<UserOutlined />} />
            <h2 style={{ marginTop: '16px', marginBottom: '4px' }}>{adminInfo.name || 'Admin'}</h2>
            <p style={{ color: '#666', margin: 0 }}>Super Admin</p>
          </div>

          <Descriptions bordered column={1}>
            <Descriptions.Item label={<><UserOutlined /> Name</>}>
              {adminInfo.name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label={<><MailOutlined /> Email</>}>
              {adminInfo.email || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label={<><PhoneOutlined /> Phone</>}>
              {adminInfo.phone || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label={<><SafetyOutlined /> Role</>}>
             Super Admin
            </Descriptions.Item>
            <Descriptions.Item label={<><CalendarOutlined /> Joined Date</>}>
              {formatDate(adminInfo.createdAt)}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  )
}
