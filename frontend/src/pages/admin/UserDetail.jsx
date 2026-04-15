import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import api from '../../utils/api'

const Sidebar = ({ handleLogout }) => (
  <aside style={{ width: '240px', background: '#1e1b4b', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh' }}>
    <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #818cf8, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>V</div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>Village API</span>
      </div>
    </div>
    <nav style={{ flex: 1, padding: '20px 12px' }}>
      {[
        { icon: '▪️', label: 'Dashboard', path: '/admin' },
        { icon: '👥', label: 'Users', path: '/admin/users', active: true },
        { icon: '🔑', label: 'API Keys', path: '/admin/keys' },
        { icon: '📈', label: 'API Logs', path: '/admin/logs' },
        { icon: '🗺️', label: 'Geography', path: '/admin/geography' },
        { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
      ].map((item, i) => (
        <Link key={i} to={item.path} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', marginBottom: '2px', background: item.active ? 'rgba(129,140,248,0.15)' : 'transparent', color: item.active ? '#a5b4fc' : 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '14px' }}>
          <span>{item.icon}</span> {item.label}
        </Link>
      ))}
    </nav>
    <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', fontSize: '14px' }}>↩ Logout</button>
    </div>
  </aside>
)

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedStates, setSelectedStates] = useState([])
  const [saved, setSaved] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['admin-user', id],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${id}`)
      return res.data.data
    }
  })

  const { data: stateAccess, isLoading: statesLoading } = useQuery({
    queryKey: ['admin-user-states', id],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${id}/states`)
      return res.data.data
    },
    onSuccess: (data) => {
      setSelectedStates(data.granted.map(s => s.id))
    }
  })

  const updateStatesMutation = useMutation({
    mutationFn: (stateIds) => api.post(`/admin/users/${id}/states`, { stateIds }),
    onSuccess: () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      queryClient.invalidateQueries(['admin-user-states', id])
    }
  })

  const grantAllMutation = useMutation({
    mutationFn: () => api.post(`/admin/users/${id}/states/all`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-user-states', id])
    }
  })

  const toggleState = (stateId) => {
    setSelectedStates(prev =>
      prev.includes(stateId)
        ? prev.filter(id => id !== stateId)
        : [...prev, stateId]
    )
  }

  const planBadge = {
    free: { bg: '#f1f5f9', color: '#475569' },
    premium: { bg: '#dcfce7', color: '#166534' },
    pro: { bg: '#dbeafe', color: '#1e40af' },
    unlimited: { bg: '#fae8ff', color: '#7e22ce' }
  }

  if (userLoading) return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>Loading...</div>

  const badge = planBadge[user?.planType] || planBadge.free

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar handleLogout={handleLogout} />
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <button onClick={() => navigate('/admin/users')} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 16px', fontSize: '14px', cursor: 'pointer', color: '#475569' }}>← Back</button>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e1b4b', margin: 0 }}>User Detail</h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>Manage user profile and state access</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>

          {/* User Profile Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '18px' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{user?.name}</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: '2px 0 0' }}>{user?.email}</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Plan', value: <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: badge.bg, color: badge.color }}>{user?.planType?.charAt(0).toUpperCase() + user?.planType?.slice(1)}</span> },
                  { label: 'Status', value: <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: user?.isActive ? '#dcfce7' : '#fef9c3', color: user?.isActive ? '#166534' : '#854d0e' }}>{user?.isActive ? '● Active' : '● Pending'}</span> },
                  { label: 'API Keys', value: <span style={{ fontSize: '14px', fontWeight: 700, color: '#6366f1' }}>{user?.apiKeys?.length || 0}</span> },
                  { label: 'Joined', value: <span style={{ fontSize: '13px', color: '#475569' }}>{new Date(user?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span> },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{row.label}</span>
                    {row.value}
                  </div>
                ))}
              </div>
            </div>

            {/* API Keys */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '0 0 16px' }}>API Keys</h3>
              {user?.apiKeys?.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>No API keys yet</p>
              ) : (
                user?.apiKeys?.map((k, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                    <code style={{ fontSize: '12px', color: '#6366f1', background: '#ede9fe', padding: '3px 8px', borderRadius: '6px' }}>{k.key}</code>
                    <span style={{ fontSize: '11px', marginLeft: '8px', color: k.isActive ? '#166534' : '#991b1b' }}>{k.isActive ? '● Active' : '● Revoked'}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* State Access Management */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: 0 }}>State Access Control</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0' }}>
                  {selectedStates.length} of {stateAccess?.all?.length || 0} states granted
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setSelectedStates([])}
                  style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Revoke All
                </button>
                <button
                  onClick={() => grantAllMutation.mutate()}
                  style={{ background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Grant All India
                </button>
              </div>
            </div>

            {/* States Grid */}
            {statesLoading ? (
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Loading states...</p>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
                  {stateAccess?.all?.map((state) => {
                    const isGranted = selectedStates.includes(state.id)
                    return (
                      <div
                        key={state.id}
                        onClick={() => toggleState(state.id)}
                        style={{ padding: '10px 14px', borderRadius: '10px', border: `1.5px solid ${isGranted ? '#6366f1' : '#e2e8f0'}`, background: isGranted ? '#ede9fe' : '#f8fafc', cursor: 'pointer', transition: 'all 0.15s' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '4px', border: `2px solid ${isGranted ? '#6366f1' : '#cbd5e1'}`, background: isGranted ? '#6366f1' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {isGranted && <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700 }}>✓</span>}
                          </div>
                          <p style={{ fontSize: '12px', fontWeight: isGranted ? 600 : 400, color: isGranted ? '#4338ca' : '#475569', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{state.name}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button
                  onClick={() => updateStatesMutation.mutate(selectedStates)}
                  disabled={updateStatesMutation.isPending}
                  style={{ width: '100%', background: saved ? '#22c55e' : '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.3s' }}
                >
                  {saved ? '✓ Access Saved!' : updateStatesMutation.isPending ? 'Saving...' : 'Save State Access'}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}