import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../utils/api'

export default function AdminApiKeys() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: keys, isLoading } = useQuery({
    queryKey: ['admin-keys'],
    queryFn: async () => {
      const res = await api.get('/admin/keys/all')
      return res.data.data
    }
  })

  const revokeMutation = useMutation({
    mutationFn: (id) => api.delete(`/keys/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['admin-keys'])
  })

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
            { icon: '🔑', label: 'API Keys', path: '/admin/keys', active: true },
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
            { icon: '📈', label: 'API Logs', path: '/admin/logs' },
            { icon: '🗺️', label: 'Geography', path: '/admin/geography' },
          ].map((item, i) => (
            <Link key={i} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
              color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '14px',
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e1b4b', margin: 0 }}>API Keys</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>All API keys across all B2B clients</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  {['User', 'API Key', 'Status', 'Plan', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {keys?.map((k, i) => (
                  <tr key={k.id} style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: 0 }}>{k.user?.name}</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{k.user?.email}</p>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <code style={{ fontSize: '12px', color: '#6366f1', background: '#ede9fe', padding: '4px 10px', borderRadius: '6px' }}>{k.key}</code>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', background: k.isActive ? '#dcfce7' : '#fee2e2', color: k.isActive ? '#166534' : '#991b1b' }}>
                        {k.isActive ? '● Active' : '● Revoked'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', background: '#f1f5f9', color: '#475569' }}>
                        {k.user?.planType?.charAt(0).toUpperCase() + k.user?.planType?.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                        {new Date(k.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {k.isActive && (
                        <button
                          onClick={() => { if (window.confirm('Revoke this key?')) revokeMutation.mutate(k.id) }}
                          style={{ fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '8px', background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer' }}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}