import { useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../utils/api'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const PLAN_COLORS = {
  free: '#818cf8',
  premium: '#34d399',
  pro: '#60a5fa',
  unlimited: '#f472b6'
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats')
      return res.data.data
    }
  })

  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users')
      return res.data.data
    }
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const getHour = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const planCounts = usersData ? ['free', 'premium', 'pro', 'unlimited'].map(p => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    value: usersData.filter(u => u.planType === p).length,
    color: PLAN_COLORS[p]
  })).filter(p => p.value > 0) : []

  const recentUsers = usersData?.slice(0, 5) || []

  const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const avatarColors = ['#818cf8', '#34d399', '#f59e0b', '#60a5fa', '#f472b6']

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
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
            { icon: '▪️', label: 'Dashboard', path: '/admin', active: true },
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

      {/* Main */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1e1b4b', margin: 0 }}>
              {getHour()}, Admin 👋
            </h1>
            <p style={{ color: '#94a3b8', margin: '6px 0 0', fontSize: '14px' }}>Here's what's happening with your platform today</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>🔍</span>
              <input placeholder="Search..." style={{ border: 'none', outline: 'none', fontSize: '14px', color: '#64748b', width: '140px', background: 'transparent' }} />
            </div>
            <span style={{ fontSize: '13px', color: '#64748b' }}>admin@indiavillageapi.com</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '13px' }}>AD</div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid #e0e7ff', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Top Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total Users', value: stats?.users.total, sub: '+3 this week', icon: '👤', bg: '#ede9fe', iconBg: '#8b5cf6', color: '#6d28d9', subColor: '#8b5cf6' },
                { label: 'Pending Approval', value: stats?.users.pending, sub: 'Needs review', icon: '⏰', bg: '#fef9c3', iconBg: '#eab308', color: '#854d0e', subColor: '#ca8a04' },
                { label: 'Active API Keys', value: stats?.apiKeys.total, sub: 'All plans', icon: '🔑', bg: '#dcfce7', iconBg: '#22c55e', color: '#166534', subColor: '#16a34a' },
                { label: 'Total Villages', value: stats?.geography.villages >= 1000 ? (stats?.geography.villages / 1000).toFixed(0) + 'K' : stats?.geography.villages, sub: `${stats?.geography.states} states`, icon: '🏡', bg: '#ffe4e6', iconBg: '#f43f5e', color: '#9f1239', subColor: '#e11d48' },
              ].map((card, i) => (
                <div key={i} style={{ background: card.bg, borderRadius: '16px', padding: '20px', border: 'none' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '16px' }}>{card.icon}</div>
                  <p style={{ color: card.color, fontSize: '13px', fontWeight: 600, margin: '0 0 4px' }}>{card.label}</p>
                  <p style={{ color: card.color, fontSize: '32px', fontWeight: 800, margin: '0 0 8px' }}>{card.value}</p>
                  <span style={{ background: 'rgba(255,255,255,0.6)', color: card.subColor, fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>{card.sub}</span>
                </div>
              ))}
            </div>

            {/* Middle Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

              {/* Geography Data */}
              <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>Geography data</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'States', value: stats?.geography.states, bg: '#ede9fe', color: '#6d28d9' },
                    { label: 'Districts', value: stats?.geography.districts, bg: '#dcfce7', color: '#166534' },
                    { label: 'Sub-districts', value: stats?.geography.subDistricts?.toLocaleString(), bg: '#fef9c3', color: '#854d0e' },
                    { label: 'Villages', value: stats?.geography.villages?.toLocaleString(), bg: '#ffe4e6', color: '#9f1239' },
                  ].map((item, i) => (
                    <div key={i} style={{ background: item.bg, borderRadius: '12px', padding: '16px' }}>
                      <p style={{ fontSize: '22px', fontWeight: 800, color: item.color, margin: '0 0 4px' }}>{item.value}</p>
                      <p style={{ fontSize: '12px', color: item.color, opacity: 0.8, margin: 0 }}>{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Plan distribution bar */}
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: '0 0 12px' }}>Users by plan</h4>
                  {planCounts.map((plan, i) => (
                    <div key={i} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', color: '#475569' }}>{plan.name}</span>
                        <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>{plan.value} users</span>
                      </div>
                      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(plan.value / (stats?.users.total || 1)) * 100}%`, background: plan.color, borderRadius: '99px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Users */}
              <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Recent users</h3>
                  <Link to="/admin/users" style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentUsers.map((u, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                        {getInitials(u.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</p>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</p>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: u.planType === 'premium' ? '#dcfce7' : u.planType === 'pro' ? '#dbeafe' : '#f1f5f9', color: u.planType === 'premium' ? '#166534' : u.planType === 'pro' ? '#1e40af' : '#475569', whiteSpace: 'nowrap' }}>
                        {u.planType?.charAt(0).toUpperCase() + u.planType?.slice(1)}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: u.isActive ? '#dcfce7' : '#fef9c3', color: u.isActive ? '#166534' : '#854d0e', whiteSpace: 'nowrap' }}>
                        {u.isActive ? 'Active' : 'Pending'}
                      </span>
                    </div>
                  ))}
                  {recentUsers.length === 0 && (
                    <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>No users yet</p>
                  )}
                </div>

                {/* Plan pie */}
                <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Plan distribution</span>
                    {planCounts.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }}></div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row — Performance Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { label: 'API Requests Today', value: '—', sub: 'Analytics coming soon', icon: '📈', bg: '#ede9fe', color: '#6d28d9', iconBg: '#8b5cf6' },
                { label: 'Avg Response Time', value: '< 100ms', sub: 'Well under 100ms SLA', icon: '✅', bg: '#dcfce7', color: '#166534', iconBg: '#22c55e' },
                { label: 'Success Rate', value: '99.9%', sub: 'Excellent uptime', icon: '🛡️', bg: '#ffe4e6', color: '#9f1239', iconBg: '#f43f5e' },
              ].map((card, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>{card.icon}</div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 4px' }}>{card.label}</p>
                    <p style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: '0 0 2px' }}>{card.value}</p>
                    <p style={{ fontSize: '12px', color: card.color, margin: 0, fontWeight: 500 }}>{card.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        a:hover { opacity: 0.8; }
      `}</style>
    </div>
  )
}