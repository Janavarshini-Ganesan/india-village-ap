import { useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../utils/api'

export default function B2BDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const { data: profile } = useQuery({
    queryKey: ['b2b-profile'],
    queryFn: async () => {
      const res = await api.get('/auth/me')
      return res.data.data
    }
  })

  const { data: keysData } = useQuery({
    queryKey: ['b2b-keys'],
    queryFn: async () => {
      const res = await api.get('/keys')
      return res.data.data
    }
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const planLimits = { free: 5000, premium: 50000, pro: 300000, unlimited: 1000000 }
  const plan = profile?.planType || 'free'
  const limit = planLimits[plan]

  const planBadgeStyle = {
    free: { bg: '#f1f5f9', color: '#475569' },
    premium: { bg: '#dcfce7', color: '#166534' },
    pro: { bg: '#dbeafe', color: '#1e40af' },
    unlimited: { bg: '#fae8ff', color: '#7e22ce' }
  }
  const badge = planBadgeStyle[plan] || planBadgeStyle.free

  const Sidebar = () => (
    <aside style={{ width: '240px', background: '#0f172a', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>IV</div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '15px', margin: 0 }}>Village API</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>Client Portal</p>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '20px 12px' }}>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px' }}>MENU</p>
        {[
          { icon: '📊', label: 'Dashboard', path: '/dashboard', active: true },
          { icon: '🔑', label: 'API Keys', path: '/dashboard/keys' },
          { icon: '📖', label: 'Docs', path: '/dashboard/docs' },
        ].map((item, i) => (
          <Link key={i} to={item.path} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
            background: item.active ? 'rgba(56,189,248,0.15)' : 'transparent',
            color: item.active ? '#38bdf8' : 'rgba(255,255,255,0.55)',
            textDecoration: 'none', fontSize: '14px', fontWeight: item.active ? 600 : 400,
          }}>
            <span>{item.icon}</span> {item.label}
          </Link>
        ))}
      </nav>
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', marginBottom: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '12px' }}>
            {profile?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.name || 'User'}</p>
            <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 8px', borderRadius: '20px', background: badge.bg, color: badge.color }}>
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
          padding: '10px 12px', borderRadius: '10px', background: 'transparent',
          color: 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', fontSize: '14px'
        }}>↩ Logout</button>
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f9ff', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0c1a2e', margin: 0 }}>
              Welcome back, {profile?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>Here's your API usage overview</p>
          </div>
          <Link to="/dashboard/keys" style={{ background: '#0ea5e9', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            + Generate API Key
          </Link>
        </div>

        {/* Plan Banner */}
        <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', borderRadius: '16px', padding: '24px', marginBottom: '24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '12px', opacity: 0.8, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Plan</p>
            <p style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px' }}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</p>
            <p style={{ fontSize: '13px', opacity: 0.8, margin: 0 }}>{limit.toLocaleString()} API requests per day</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', opacity: 0.8, margin: '0 0 8px' }}>Active API Keys</p>
            <p style={{ fontSize: '36px', fontWeight: 800, margin: 0 }}>{keysData?.length || 0}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Daily Limit', value: limit.toLocaleString(), sub: 'requests per day', icon: '📊', bg: '#e0f2fe', color: '#0369a1', iconBg: '#0ea5e9' },
            { label: 'Active Keys', value: keysData?.length || 0, sub: 'of 5 max allowed', icon: '🔑', bg: '#ede9fe', color: '#6d28d9', iconBg: '#8b5cf6' },
            { label: 'Plan Status', value: profile?.isActive ? 'Active' : 'Pending', sub: profile?.isActive ? 'Account verified' : 'Awaiting approval', icon: '✅', bg: profile?.isActive ? '#dcfce7' : '#fef9c3', color: profile?.isActive ? '#166534' : '#854d0e', iconBg: profile?.isActive ? '#22c55e' : '#eab308' },
          ].map((card, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e0f2fe', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{card.icon}</div>
              <div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 4px' }}>{card.label}</p>
                <p style={{ fontSize: '22px', fontWeight: 800, color: '#0c1a2e', margin: '0 0 2px' }}>{card.value}</p>
                <p style={{ fontSize: '12px', color: card.color, margin: 0 }}>{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Start Guide */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0f2fe', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 20px' }}>Quick Start Guide</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { step: '01', title: 'Generate API Key', desc: 'Go to API Keys tab and create your first key', color: '#0ea5e9', bg: '#e0f2fe' },
              { step: '02', title: 'Make a Request', desc: 'Add x-api-key header to your API calls', color: '#8b5cf6', bg: '#ede9fe' },
              { step: '03', title: 'Use the Data', desc: 'Integrate village data into your application', color: '#22c55e', bg: '#dcfce7' },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: '12px', padding: '20px' }}>
                <p style={{ fontSize: '28px', fontWeight: 800, color: s.color, margin: '0 0 8px', opacity: 0.4 }}>{s.step}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 6px' }}>{s.title}</p>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* API Endpoints Reference */}
        <div style={{ background: '#0c1a2e', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>API Endpoints</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { method: 'GET', path: '/api/v1/states', desc: 'List all states' },
              { method: 'GET', path: '/api/v1/districts?stateId=1', desc: 'Districts by state' },
              { method: 'GET', path: '/api/v1/subdistricts?districtId=1', desc: 'Sub-districts by district' },
              { method: 'GET', path: '/api/v1/villages?subDistrictId=1', desc: 'Villages by sub-district' },
              { method: 'GET', path: '/api/v1/villages/search?q=Chennai', desc: 'Search villages by name' },
              { method: 'GET', path: '/api/v1/hierarchy?villageId=1', desc: 'Full address hierarchy' },
            ].map((ep, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#0ea5e9', color: '#fff', minWidth: '36px', textAlign: 'center' }}>{ep.method}</span>
                <code style={{ fontSize: '13px', color: '#38bdf8', flex: 1 }}>{ep.path}</code>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}