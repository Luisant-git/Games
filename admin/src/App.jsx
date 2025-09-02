import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Orders from './pages/Orders'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Games from './pages/Games'
import Agent from './pages/Agent'
import Commission from './pages/Commission'
import Category from './pages/Category'
import Timing from './pages/Timing'
import Deposit from './pages/Deposit'
import './App.css'


function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path='category' element={<Category />}></Route>
            <Route path='timing' element={<Timing />}></Route>
            <Route path="players" element={<Users />} />
            <Route path="orders" element={<Orders />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="board" element={<Games />} />
            <Route path="agents" element={<Agent />} />
            <Route path="agents/:agentId/commission" element={<Commission />} />
            <Route path="settings" element={<Settings />} />
            <Route path="deposit" element={<Deposit />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </ThemeProvider>
  )
}

export default App
