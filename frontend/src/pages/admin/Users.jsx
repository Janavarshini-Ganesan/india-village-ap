import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import api from '../../utils/api'

export default function AdminUsers() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users')
      return res.data.data
    }
  })

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/users/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries(['admin-users'])
  })

  const suspendMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/users/${id}/suspend`),
    onSuccess: () => queryClient.invalidateQueries(['admin-users'])
  })

  const planMutation = useMutation({
    mutationFn: ({ id, planType }) => api.patch(`/admin/users/${id}/plan`, { planType }),
    onSuccess: () => queryClient.invalidateQueries(['admin-users'])
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['admin-users'])
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const filtered = users?.filter(u => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter ||
      (statusFilter === 'active' && u.isActive) ||
      (statusFilter === 'pending' && !u.isActive)
    const matchPlan = !planFilter || u.planType === planFilter
    return matchSearch && matchStatus && matchPlan
  }) || []

  const getInitials = (name) =>
    name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const avatarColors = ['#818cf8', '#34d399', '#f59e0b', '#60a5fa', '#f472b6', '#fb7185', '#a78bfa']

  const planBadge = (plan) => {
    const styles = {
      free: { bg: '#f1f5f9', color: '#475569' },
      premium: { bg: '#dcfce7', color: '#166534' },
      pro: { bg: '#dbeafe', color: '#1e40af' },
      unlimited: { bg: '#fae8ff', color: '#7e22ce' }
    }
    const s = styles[plan] || styles.free
    return (
      <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: s.bg, color: s.color }}>
        {plan?.charAt(0).toUpperCase() + plan?.slice(1)}
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{ width: '240px', background: '#1e1b4b', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #818cf8, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>IV</div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>Village API</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '20px 12px' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 8px', marginBottom: '8px' }}>MAIN</p>
          {[
            { icon: '▪️', label: 'Dashboard', path: '/admin' },
            { icon: '👥', label: 'Users', path: '/admin/users', active: true },
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

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e1b4b', margin: 0 }}>User Management</h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>Manage B2B client accounts and approvals</p>
          </div>
          <div style={{ background: '#6366f1', color: '#fff', padding: '8px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: 600 }}>
            {filtered.length} Users
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '16px 20px', border: '1px solid #f1f5f9', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            placeholder="🔍  Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 14px', fontSize: '14px', color: '#475569', outline: 'none' }}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 14px', fontSize: '14px', color: '#475569', outline: 'none', background: '#fff' }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
            style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 14px', fontSize: '14px', color: '#475569', outline: 'none', background: '#fff' }}
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="pro">Pro</option>
            <option value="unlimited">Unlimited</option>
          </select>
          {(search || statusFilter || planFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setPlanFilter('') }}
              style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 14px', fontSize: '14px', color: '#ef4444', background: '#fff', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading users...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>No users found</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                  {['User', 'Plan', 'Status', 'API Keys', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* User */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: 0 }}>{u.name}</p>
                          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td style={{ padding: '16px 20px' }}>
                      <select
                        value={u.planType}
                        onChange={e => planMutation.mutate({ id: u.id, planType: e.target.value })}
                        style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', color: '#475569', background: '#f8fafc', cursor: 'pointer', outline: 'none' }}
                      >
                        {['free', 'premium', 'pro', 'unlimited'].map(p => (
                          <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                        ))}
                      </select>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px',
                        background: u.isActive ? '#dcfce7' : '#fef9c3',
                        color: u.isActive ? '#166534' : '#854d0e'
                      }}>
                        {u.isActive ? '● Active' : '● Pending'}
                      </span>
                    </td>

                    {/* API Keys */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#6366f1' }}>{u._count?.apiKeys || 0}</span>
                    </td>

                    {/* Joined */}
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!u.isActive ? (
                          <button
                            onClick={() => approveMutation.mutate(u.id)}
                            style={{ fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '8px', background: '#dcfce7', color: '#166534', border: 'none', cursor: 'pointer' }}
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => suspendMutation.mutate(u.id)}
                            style={{ fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '8px', background: '#fef9c3', color: '#854d0e', border: 'none', cursor: 'pointer' }}
                          >
                            Suspend
                          </button>
                        )}
                        <button
                          onClick={() => { if (window.confirm('Delete this user?')) deleteMutation.mutate(u.id) }}
                          style={{ fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '8px', background: '#ffe4e6', color: '#9f1239', border: 'none', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
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