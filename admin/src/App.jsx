import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Orders from './pages/Orders'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Games from './pages/Games'
import Agent from './pages/Agent'
import AgentGameHistory from './pages/AgentGameHistory'
import AgentOverview from './pages/AgentOverview'
import Commission from './pages/Commission'
import Category from './pages/Category'
import Timing from './pages/Timing'
import Deposit from './pages/Deposit'
import Withdraw from './pages/Withdraw'
import './App.css'
import GameHistory from './pages/GameHistory'
import Result from './pages/Result'
import HistoryShowTime from './pages/HistoryShowTime'


function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/category" replace />} />
            <Route path='category' element={<Category />}></Route>
            <Route path='timing' element={<Timing />}></Route>
            <Route path="players" element={<Users />} />
            <Route path="orders" element={<Orders />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="board" element={<Games />} />
            <Route path="agents" element={<Agent />} />
            <Route path="agents/:agentId/commission" element={<Commission />} />
            <Route path="agents/:agentId/game-history" element={<AgentGameHistory />} />
            <Route path="agent-overview" element={<AgentOverview />} />
            <Route path="settings" element={<Settings />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="withdraw" element={<Withdraw />} />
            <Route path='results' element={<Result />}></Route>
            <Route path='game-history' element={<GameHistory />}></Route>
            <Route path='history-showtime' element={<HistoryShowTime />}></Route>
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </ThemeProvider>
  )
}

export default App
