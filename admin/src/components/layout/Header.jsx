import { useLocation, useNavigate } from 'react-router-dom'
import { Dropdown, message } from 'antd'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import profile3 from '../../assets/profile3.png'

const Header = ({ onMenuToggle, isMobile }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('adminToken')
    message.success('Logged out successfully')
    navigate('/login')
  }

  const menuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout
    }
  ]

  const getPageTitle = () => {
    const routes = {
      '/players': 'Players',
      '/category': 'Category',
      '/agents': 'Agents',
      '/agent-overview': 'Agent Games Overview',
      '/orders': 'Orders',
      '/board': 'Board',
      '/timing': 'Timing',
      '/deposit': 'Deposit',
      '/analytics': 'Analytics',
      '/settings': 'Settings',
      '/game-history': 'Game History',
      '/results': 'Results',
      '/history-showtime': 'History Showtime',
      '/order-report': 'Order Report',
      '/summary-report': 'Summary Report',
      '/player-report': 'Player Report',
      '/agent-report': 'Agent Report',
    }
    
    // Handle dynamic routes
    if (location.pathname.includes('/agents/') && location.pathname.includes('/commission')) {
      return 'Agent Commission'
    }
    if (location.pathname.includes('/agents/') && location.pathname.includes('/game-history')) {
      return 'Agent Game History'
    }
    return routes[location.pathname] || 'Admin Panel'
  }

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>
      <div className="header-actions">
        <Dropdown
          menu={{ items: menuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <div className="user-menu" style={{ cursor: 'pointer' }}>
            <img src={profile3} alt="User" className="avatar" />
            <span className={`username ${isMobile ? 'mobile-hidden' : ''}`}>Admin</span>
          </div>
        </Dropdown>
      </div>
    </header>
  )
}

export default Header