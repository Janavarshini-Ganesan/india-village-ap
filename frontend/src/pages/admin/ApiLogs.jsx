import { useNavigate, Link } from 'react-router-dom'

export default function AdminApiLogs() {
  const navigate = useNavigate()
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const Sidebar = () => (
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
            { icon: '▪️', label: 'Dashboard', path: '/admin' },
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
            { icon: '📈', label: 'API Logs', path: '/admin/logs' , active: true},
            { icon: '🗺️', label: 'Geography', path: '/admin/geography' },
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

  const mockLogs = [
    { id: 1, endpoint: '/api/v1/states', status: 200, time: '23ms', user: 'Test Business', key: 'ak_****abcd', date: '2026-04-11 10:23:01' },
    { id: 2, endpoint: '/api/v1/villages/search?q=Chennai', status: 200, time: '45ms', user: 'Acme Corp', key: 'ak_****efgh', date: '2026-04-11 10:22:45' },
    { id: 3, endpoint: '/api/v1/districts?stateId=1', status: 200, time: '31ms', user: 'Test Business', key: 'ak_****abcd', date: '2026-04-11 10:22:10' },
    { id: 4, endpoint: '/api/v1/villages?subDistrictId=99', status: 404, time: '12ms', user: 'Shopline India', key: 'ak_****ijkl', date: '2026-04-11 10:21:55' },
    { id: 5, endpoint: '/api/v1/hierarchy?villageId=1', status: 200, time: '67ms', user: 'LogiTrack', key: 'ak_****mnop', date: '2026-04-11 10:21:30' },
    { id: 6, endpoint: '/api/v1/states', status: 429, time: '5ms', user: 'Zippy Pay', key: 'ak_****qrst', date: '2026-04-11 10:21:00' },
  ]

  const statusColor = (code) => {
    if (code >= 200 && code < 300) return { bg: '#dcfce7', color: '#166534' }
    if (code === 429) return { bg: '#fef9c3', color: '#854d0e' }
    return { bg: '#fee2e2', color: '#991b1b' }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e1b4b', margin: 0 }}>API Logs</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>Monitor API usage across all clients</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Requests', value: '12,480', bg: '#ede9fe', color: '#6d28d9' },
            { label: 'Success (2xx)', value: '12,350', bg: '#dcfce7', color: '#166534' },
            { label: 'Rate Limited', value: '98', bg: '#fef9c3', color: '#854d0e' },
            { label: 'Errors (4xx/5xx)', value: '32', bg: '#fee2e2', color: '#991b1b' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: '14px', padding: '18px' }}>
              <p style={{ fontSize: '12px', color: s.color, margin: '0 0 6px', fontWeight: 600 }}>{s.label}</p>
              <p style={{ fontSize: '26px', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Logs Table */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Recent Requests</h3>
            <span style={{ fontSize: '12px', color: '#94a3b8', background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px' }}>Sample data — real logs coming soon</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Endpoint', 'Status', 'Time', 'User', 'API Key', 'Timestamp'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockLogs.map((log) => {
                const s = statusColor(log.status)
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <code style={{ fontSize: '12px', color: '#6366f1' }}>{log.endpoint}</code>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: s.bg, color: s.color }}>{log.status}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>{log.time}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '13px', color: '#1e293b' }}>{log.user}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <code style={{ fontSize: '12px', color: '#94a3b8' }}>{log.key}</code>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{log.date}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}