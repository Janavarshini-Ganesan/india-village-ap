import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminApiKeys from './pages/admin/ApiKeys'
import AdminApiLogs from './pages/admin/ApiLogs'
import AdminGeography from './pages/admin/Geography'
import B2BDashboard from './pages/b2b/Dashboard'
import B2BApiKeys from './pages/b2b/ApiKeys'
import B2BDocs from './pages/b2b/Docs'
import ProtectedRoute from './components/ProtectedRoute'
import AdminSettings from './pages/admin/Settings'
import Demo from './pages/Demo'

// inside Routes add:
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/keys" element={<ProtectedRoute role="admin"><AdminApiKeys /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute role="admin"><AdminApiLogs /></ProtectedRoute>} />
          <Route path="/admin/geography" element={<ProtectedRoute role="admin"><AdminGeography /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />

          {/* B2B Routes */}
          <Route path="/dashboard" element={<ProtectedRoute role="user"><B2BDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/keys" element={<ProtectedRoute role="user"><B2BApiKeys /></ProtectedRoute>} />
          <Route path="/dashboard/docs" element={<ProtectedRoute role="user"><B2BDocs /></ProtectedRoute>} />

          <Route path="/demo" element={<Demo />} />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App