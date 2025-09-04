import { useLocation } from 'react-router-dom'
import profile3 from '../../assets/profile3.png'

const Header = ({ onMenuToggle, isMobile }) => {
  const location = useLocation()

  const getPageTitle = () => {
    const routes = {
      '/': 'Dashboard',
      '/players': 'Players',
      '/category': 'Category',
      '/agents': 'Agents',
      '/orders': 'Orders',
      '/board': 'Board',
      '/timing': 'Timing',
      '/deposit': 'Deposit',
      '/analytics': 'Analytics',
      '/settings': 'Settings'
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
        <button 
          className="notification-btn"
          aria-label="Notifications"
        >
          🔔
        </button>
        <div className="user-menu">
          <img src={profile3} alt="User" className="avatar" />
          <span className={`username ${isMobile ? 'mobile-hidden' : ''}`}>Admin</span>
        </div>
      </div>
    </header>
  )
}

export default Header