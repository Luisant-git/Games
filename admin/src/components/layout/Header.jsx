import { useLocation } from 'react-router-dom'
import profile3 from '../../assets/profile3.png'

const Header = ({ onMenuToggle }) => {
  const location = useLocation()

  const getPageTitle = () => {
    const routes = {
      '/': 'Dashboard',
      '/players': 'Players',
      'category': 'Category',
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
      <button 
        className="menu-btn"
        onClick={onMenuToggle}
      >
        ☰
      </button>
      <h1 className="page-title">{getPageTitle()}</h1>
      <div className="header-actions">
        <button className="notification-btn">🔔</button>
        <div className="user-menu">
          <img src={profile3} alt="User" className="avatar" />
          <span className="username mobile-hidden">Admin</span>
        </div>
      </div>
    </header>
  )
}

export default Header