import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth > 768) {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="admin-panel">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={handleSidebarClose}
        isMobile={isMobile}
      />
      
      {sidebarOpen && isMobile && (
        <div 
          className="overlay mobile-only"
          onClick={handleSidebarClose}
        />
      )}

      <main className="main-content">
        <Header 
          onMenuToggle={() => setSidebarOpen(true)}
          isMobile={isMobile}
        />
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout