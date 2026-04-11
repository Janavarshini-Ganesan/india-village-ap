import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

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
          {(() => {
            const isActive = location.pathname === '/admin/settings';
            return (
              <Link to="/admin/settings" style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px',
                background: isActive ? 'rgba(129,140,248,0.15)' : 'transparent',
                color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.55)',
                textDecoration: 'none', fontSize: '14px', fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s'
              }}>
                <span>⚙️</span> Settings
              </Link>
            );
          })()}
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

export default function AdminSettings() {
  const navigate = useNavigate()
  const [saved, setSaved] = useState('')
  const [form, setForm] = useState({
    platformName: 'India Village API',
    supportEmail: 'admin@indiavillageapi.com',
    maxKeysPerUser: 5,
    defaultPlan: 'free',
    maintenanceMode: false,
    autoApprove: false,
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleSave = (section) => {
    setSaved(section)
    setTimeout(() => setSaved(''), 2000)
  }

  const inputStyle = { width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', color: '#475569', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar handleLogout={handleLogout} />
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e1b4b', margin: 0 }}>Settings</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>Configure platform settings and preferences</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>

          {/* General Settings */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>General Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Platform Name</label>
                <input style={inputStyle} value={form.platformName} onChange={e => setForm({ ...form, platformName: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Support Email</label>
                <input style={inputStyle} type="email" value={form.supportEmail} onChange={e => setForm({ ...form, supportEmail: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Max API Keys Per User</label>
                <input style={inputStyle} type="number" value={form.maxKeysPerUser} onChange={e => setForm({ ...form, maxKeysPerUser: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Default Plan for New Users</label>
                <select style={inputStyle} value={form.defaultPlan} onChange={e => setForm({ ...form, defaultPlan: e.target.value })}>
                  {['free', 'premium', 'pro', 'unlimited'].map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => handleSave('general')} style={{ background: saved === 'general' ? '#22c55e' : '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', width: 'fit-content', transition: 'background 0.3s' }}>
                {saved === 'general' ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Platform Controls */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>Platform Controls</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'autoApprove', label: 'Auto-approve new registrations', desc: 'Skip admin approval for new B2B accounts', color: '#22c55e' },
                { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Block all API requests temporarily', color: '#ef4444' },
              ].map((toggle, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: 0 }}>{toggle.label}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0' }}>{toggle.desc}</p>
                  </div>
                  <div
                    onClick={() => setForm({ ...form, [toggle.key]: !form[toggle.key] })}
                    style={{ width: '48px', height: '26px', borderRadius: '99px', background: form[toggle.key] ? toggle.color : '#e2e8f0', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0 }}
                  >
                    <div style={{ position: 'absolute', top: '3px', left: form[toggle.key] ? '24px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.3s' }}></div>
                  </div>
                </div>
              ))}
              <button onClick={() => handleSave('controls')} style={{ background: saved === 'controls' ? '#22c55e' : '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', width: 'fit-content', transition: 'background 0.3s' }}>
                {saved === 'controls' ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Plan Limits */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>Plan Limits Overview</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Plan', 'Daily Requests', 'Per Minute', 'Price'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { plan: 'Free', daily: '5,000', pm: '100', price: '$0/mo', color: '#f1f5f9', text: '#475569' },
                  { plan: 'Premium', daily: '50,000', pm: '500', price: '$49/mo', color: '#dcfce7', text: '#166534' },
                  { plan: 'Pro', daily: '300,000', pm: '2,000', price: '$199/mo', color: '#dbeafe', text: '#1e40af' },
                  { plan: 'Unlimited', daily: '1,000,000', pm: '5,000', price: '$499/mo', color: '#fae8ff', text: '#7e22ce' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', background: r.color, color: r.text }}>{r.plan}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#475569' }}>{r.daily}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#475569' }}>{r.pm}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{r.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Danger Zone */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '2px solid #fee2e2' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#991b1b', margin: '0 0 16px' }}>Danger Zone</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Clear API Logs', desc: 'Permanently delete all API request logs', btn: 'Clear Logs' },
                { label: 'Reset All Rate Limits', desc: 'Reset Redis rate limit counters for all users', btn: 'Reset Limits' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#fff5f5', borderRadius: '10px', border: '1px solid #fee2e2' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#991b1b', margin: 0 }}>{item.label}</p>
                    <p style={{ fontSize: '12px', color: '#f87171', margin: '2px 0 0' }}>{item.desc}</p>
                  </div>
                  <button
                    onClick={() => window.confirm(`Are you sure? This cannot be undone.`)}
                    style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
                  >
                    {item.btn}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}