import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Landing from './pages/Landing'
import GovDashboard from './pages/GovDashboard'
import UserDashboard from './pages/UserDashboard'
import AIVerify from './pages/AIVerify'
import WalletDashboard from './pages/WalletDashboard'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/gov-dashboard" element={<GovDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/ai-verify" element={<AIVerify />} />
          <Route path="/wallet" element={<WalletDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
