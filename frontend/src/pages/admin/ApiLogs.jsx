import { useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../utils/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Sidebar = ({ handleLogout }) => (
  <aside style={{ width: '240px', background: '#1e1b4b', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #818cf8, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>V</div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>Village API</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '20px 12px' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px' }}>MAIN</p>
          {[
            { icon: '▪️', label: 'Dashboard', path: '/admin'},
            { icon: '👥', label: 'Users', path: '/admin/users' },
            { icon: '🔑', label: 'API Keys', path: '/admin/keys' },
          ].map((item, i) => (
            <Link key={i} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
              background: item.active ? 'rgba(129,140,248,0.15)' : 'transparent',
              color: item.active ? '#a5b4fc' : 'rgba(255,255,255,0.55)',
              textDecoration: 'none', fontSize: '14px', fontWeight: item.active ? 600 : 400,
              transition: 'all 0.15s'
            }}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span> {item.label}
            </Link>
          ))}

          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 8px', margin: '20px 0 8px' }}>ANALYTICS</p>
          {[
            { icon: '📈', label: 'API Logs', path: '/admin/logs', active: true },
            { icon: '🗺️', label: 'Geography', path: '/admin/geography'  },
          ].map((item, i) => (
            <Link key={i} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
              background: item.active ? 'rgba(129,140,248,0.15)' : 'transparent',
              color: item.active ? '#a5b4fc' : 'rgba(255,255,255,0.55)',
              textDecoration: 'none', fontSize: '14px', fontWeight: item.active ? 600 : 400,
              transition: 'all 0.15s'
            }}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span> {item.label}
            </Link>
          ))}

          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 8px', margin: '20px 0 8px' }}>SETTINGS</p>
          <Link to="/admin/settings" style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px',
            color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '14px',
          }}>
            <span>⚙️</span> Settings
          </Link>
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
            padding: '10px 12px', borderRadius: '10px', background: 'transparent',
            color: 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', fontSize: '14px'
          }}>
            ↩ Logout
          </button>
        </div>
      </aside>
)

export default function AdminApiLogs() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const res = await api.get('/admin/logs')
      return res.data
    },
    refetchInterval: 30000 // auto refresh every 30 seconds
  })

  const logs = data?.data || []
  const stats = data?.stats || {}

  const statusColor = (code) => {
    if (code >= 200 && code < 300) return { bg: '#dcfce7', color: '#166534' }
    if (code === 429) return { bg: '#fef9c3', color: '#854d0e' }
    return { bg: '#fee2e2', color: '#991b1b' }
  }

  // Build chart data from logs (group by hour)
  const chartData = logs.reduce((acc, log) => {
    const hour = new Date(log.createdAt).getHours() + ':00'
    const existing = acc.find(a => a.hour === hour)
    if (existing) existing.requests++
    else acc.push({ hour, requests: 1 })
    return acc
  }, []).slice(-12)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar handleLogout={handleLogout} />
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e1b4b', margin: 0 }}>API Logs</h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>Real-time API usage across all clients</p>
          </div>
          <button
            onClick={() => refetch()}
            style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Requests', value: stats.total || 0, bg: '#ede9fe', color: '#6d28d9' },
            { label: 'Success (2xx)', value: stats.success || 0, bg: '#dcfce7', color: '#166534' },
            { label: 'Rate Limited', value: stats.rateLimited || 0, bg: '#fef9c3', color: '#854d0e' },
            { label: 'Errors (4xx/5xx)', value: stats.errors || 0, bg: '#fee2e2', color: '#991b1b' },
            { label: 'Avg Response', value: `${stats.avgTime || 0}ms`, bg: '#e0f2fe', color: '#0369a1' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: '14px', padding: '18px' }}>
              <p style={{ fontSize: '12px', color: s.color, margin: '0 0 6px', fontWeight: 600 }}>{s.label}</p>
              <p style={{ fontSize: '24px', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>Requests by Hour</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Line type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Logs Table */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Recent Requests</h3>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Last 100 requests • Auto-refreshes every 30s</span>
          </div>

          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading logs...</div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <p style={{ fontSize: '32px', margin: '0 0 12px' }}>📭</p>
              <p style={{ color: '#1e293b', fontWeight: 600, margin: '0 0 6px' }}>No logs yet</p>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Logs will appear when B2B users make API requests</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Endpoint', 'Status', 'Time', 'User', 'API Key', 'Timestamp'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const s = statusColor(log.statusCode)
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f8fafc' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <code style={{ fontSize: '12px', color: '#6366f1' }}>{log.endpoint}</code>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: s.bg, color: s.color }}>{log.statusCode}</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: '13px', color: log.responseTime > 100 ? '#f59e0b' : '#22c55e', fontWeight: 600 }}>{log.responseTime}ms</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontSize: '13px', color: '#1e293b', margin: 0, fontWeight: 500 }}>{log.user}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{log.email}</p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <code style={{ fontSize: '12px', color: '#94a3b8' }}>{log.apiKey}</code>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {new Date(log.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}