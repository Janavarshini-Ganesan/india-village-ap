import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link ,useLocation} from 'react-router-dom'
import { useState } from 'react'
import api from '../../utils/api'

export default function B2BApiKeys() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [newKeyName, setNewKeyName] = useState('')
  const [generatedKey, setGeneratedKey] = useState(null)
  const [copied, setCopied] = useState('')

  const { data: profile } = useQuery({
    queryKey: ['b2b-profile'],
    queryFn: async () => {
      const res = await api.get('/auth/me')
      return res.data.data
    }
  })

  const { data: keys, isLoading } = useQuery({
    queryKey: ['b2b-keys'],
    queryFn: async () => {
      const res = await api.get('/keys')
      return res.data.data
    }
  })

  const generateMutation = useMutation({
    mutationFn: (name) => api.post('/keys/generate', { name }),
    onSuccess: (res) => {
      setGeneratedKey(res.data.data)
      setNewKeyName('')
      queryClient.invalidateQueries(['b2b-keys'])
    }
  })

  const revokeMutation = useMutation({
    mutationFn: (id) => api.delete(`/keys/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['b2b-keys'])
  })

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const location = useLocation();

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


  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f9ff', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
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
          { icon: '📊', label: 'Dashboard', path: '/dashboard' },
          { icon: '🔑', label: 'API Keys', path: '/dashboard/keys' },
          { icon: '📖', label: 'Docs', path: '/dashboard/docs' },
          { icon: '💳', label: 'Billing & Plans', path: '/dashboard/billing' },
        ].map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={i} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
              background: isActive ? 'rgba(56,189,248,0.15)' : 'transparent',
              color: isActive ? '#38bdf8' : 'rgba(255,255,255,0.55)',
              textDecoration: 'none', fontSize: '14px', fontWeight: isActive ? 600 : 400,
            }}>
              <span>{item.icon}</span> {item.label}
            </Link>
          );
        })}

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

      {/* Main */}
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0c1a2e', margin: 0 }}>API Key Management</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>Generate and manage your API keys — max 5 active keys</p>
        </div>

        {/* Generated Key Alert */}
        {generatedKey && (
          <div style={{ background: '#0c1a2e', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '2px solid #0ea5e9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <p style={{ color: '#38bdf8', fontWeight: 700, fontSize: '16px', margin: 0 }}>🎉 API Key Generated!</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '4px 0 0' }}>Save your secret now — it will never be shown again!</p>
              </div>
              <button onClick={() => setGeneratedKey(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}>Dismiss</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'API Key', value: generatedKey.key, id: 'key' },
                { label: 'API Secret', value: generatedKey.secret, id: 'secret' },
              ].map(item => (
                <div key={item.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</p>
                    <code style={{ color: '#38bdf8', fontSize: '13px', wordBreak: 'break-all' }}>{item.value}</code>
                  </div>
                  <button
                    onClick={() => handleCopy(item.value, item.id)}
                    style={{ background: copied === item.id ? '#22c55e' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}
                  >
                    {copied === item.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate New Key */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0f2fe', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 16px' }}>Generate New Key</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              placeholder="Key name (e.g. Production Server)"
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 16px', fontSize: '14px', color: '#475569', outline: 'none' }}
              onKeyDown={e => e.key === 'Enter' && newKeyName && generateMutation.mutate(newKeyName)}
            />
            <button
              onClick={() => newKeyName && generateMutation.mutate(newKeyName)}
              disabled={!newKeyName || generateMutation.isPending}
              style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: !newKeyName ? 0.5 : 1 }}
            >
              {generateMutation.isPending ? 'Generating...' : '+ Generate'}
            </button>
          </div>
        </div>

        {/* Keys Table */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e0f2fe', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f9ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0c1a2e', margin: 0 }}>Your API Keys</h3>
            <span style={{ fontSize: '13px', color: '#64748b' }}>{keys?.length || 0} / 5 keys</span>
          </div>

          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading keys...</div>
          ) : keys?.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🔑</p>
              <p style={{ color: '#0c1a2e', fontWeight: 600, fontSize: '16px', margin: '0 0 6px' }}>No API keys yet</p>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Generate your first key above to get started</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0f9ff' }}>
                  {['API Key', 'Status', 'Created', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {keys?.map((k, i) => (
                  <tr key={k.id} style={{ borderBottom: '1px solid #f0f9ff' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <code style={{ fontSize: '13px', color: '#0369a1', background: '#e0f2fe', padding: '4px 10px', borderRadius: '6px' }}>{k.key}</code>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', background: k.isActive ? '#dcfce7' : '#fee2e2', color: k.isActive ? '#166534' : '#991b1b' }}>
                        {k.isActive ? '● Active' : '● Revoked'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        {new Date(k.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {k.isActive && (
                        <button
                          onClick={() => { if (window.confirm('Revoke this key?')) revokeMutation.mutate(k.id) }}
                          style={{ fontSize: '12px', fontWeight: 600, padding: '5px 14px', borderRadius: '8px', background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer' }}
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

        {/* Usage info */}
        <div style={{ marginTop: '20px', background: '#e0f2fe', borderRadius: '12px', padding: '16px 20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '18px' }}>ℹ️</span>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#0369a1', margin: '0 0 4px' }}>How to use your API key</p>
            <p style={{ fontSize: '13px', color: '#0369a1', margin: 0 }}>Add <code style={{ background: 'rgba(255,255,255,0.6)', padding: '1px 6px', borderRadius: '4px' }}>x-api-key: YOUR_KEY</code> header to all API requests. Your daily limit is <strong>{({ free: '5,000', premium: '50,000', pro: '300,000', unlimited: '1,000,000' })[plan]}</strong> requests on the <strong>{plan}</strong> plan.</p>
          </div>
        </div>

      </main>
    </div>
  )
}