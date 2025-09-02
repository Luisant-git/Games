import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-panel">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {sidebarOpen && (
        <div 
          className="overlay mobile-only"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-content">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout