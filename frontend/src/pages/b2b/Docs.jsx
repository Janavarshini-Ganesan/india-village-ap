import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import api from '../../utils/api'

export default function B2BDocs() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: profile } = useQuery({
    queryKey: ['b2b-profile'],
    queryFn: async () => {
      const res = await api.get('/auth/me')
      return res.data.data
    }
  })
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const endpoints = [
    { method: 'GET', path: '/api/v1/states', desc: 'List all states', params: 'None', example: '{"success":true,"count":34,"data":[{"id":1,"code":"27","name":"MAHARASHTRA"}]}' },
    { method: 'GET', path: '/api/v1/districts', desc: 'Get districts by state', params: 'stateId (required)', example: '{"success":true,"count":36,"data":[{"id":1,"code":"487","name":"AHMEDNAGAR"}]}' },
    { method: 'GET', path: '/api/v1/subdistricts', desc: 'Get sub-districts by district', params: 'districtId (required)', example: '{"success":true,"count":14,"data":[...]}' },
    { method: 'GET', path: '/api/v1/villages', desc: 'Get villages by sub-district', params: 'subDistrictId (required)', example: '{"success":true,"count":120,"data":[...]}' },
    { method: 'GET', path: '/api/v1/villages/search', desc: 'Search villages by name', params: 'q (min 2 chars)', example: '{"success":true,"count":5,"data":[{"name":"Chennai",...}]}' },
    { method: 'GET', path: '/api/v1/hierarchy', desc: 'Get full address hierarchy', params: 'villageId (required)', example: '{"success":true,"data":{"formattedAddress":"Village, SubDist, Dist, State, India"}}' },
  ]

  const codeExamples = {
    curl: `curl -X GET "https://india-village-ap.vercel.app/api/v1/states" \\
  -H "x-api-key: YOUR_API_KEY"`,
    javascript: `const response = await fetch(
  'https://india-village-ap.vercel.app/api/v1/states',
  { headers: { 'x-api-key': 'YOUR_API_KEY' } }
)
const data = await response.json()
console.log(data.data) // array of states`,
    python: `import requests

response = requests.get(
  'https://india-village-ap.vercel.app/api/v1/states',
  headers={'x-api-key': 'YOUR_API_KEY'}
)
print(response.json())`,
  }

  const [codeLang, setCodeLang] = useState('curl')
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

      <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0c1a2e', margin: 0 }}>API Documentation</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>Everything you need to integrate the India Village API</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#fff', padding: '6px', borderRadius: '12px', border: '1px solid #e0f2fe', width: 'fit-content' }}>
          {['overview', 'endpoints', 'examples'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: activeTab === tab ? '#0ea5e9' : 'transparent', color: activeTab === tab ? '#fff' : '#64748b', transition: 'all 0.15s' }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0f2fe' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 16px' }}>Authentication</h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px' }}>All API requests require an API key passed in the request header:</p>
              <div style={{ background: '#0c1a2e', borderRadius: '10px', padding: '16px' }}>
                <code style={{ color: '#38bdf8', fontSize: '13px' }}>x-api-key: YOUR_API_KEY</code>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0f2fe' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 16px' }}>Base URL</h3>
              <div style={{ background: '#0c1a2e', borderRadius: '10px', padding: '16px' }}>
                <code style={{ color: '#38bdf8', fontSize: '13px' }}>https://india-village-ap.vercel.app</code>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0f2fe' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 16px' }}>Response Format</h3>
              <div style={{ background: '#0c1a2e', borderRadius: '10px', padding: '16px' }}>
                <pre style={{ color: '#e2e8f0', fontSize: '13px', margin: 0, lineHeight: 1.7 }}>{`{
  "success": true,
  "count": 25,
  "data": [...],
}`}</pre>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0f2fe' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 16px' }}>Rate Limits</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f0f9ff' }}>
                    {['Plan', 'Daily Limit', 'Per Minute'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#64748b' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { plan: 'Free', daily: '5,000', pm: '100' },
                    { plan: 'Premium', daily: '50,000', pm: '500' },
                    { plan: 'Pro', daily: '300,000', pm: '2,000' },
                    { plan: 'Unlimited', daily: '1,000,000', pm: '5,000' },
                  ].map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f9ff' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#0c1a2e' }}>{r.plan}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#0369a1' }}>{r.daily}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#64748b' }}>{r.pm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Endpoints Tab */}
        {activeTab === 'endpoints' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {endpoints.map((ep, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #e0f2fe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: '#0ea5e9', color: '#fff' }}>{ep.method}</span>
                  <code style={{ fontSize: '14px', color: '#0369a1', fontWeight: 600 }}>{ep.path}</code>
                  <span style={{ fontSize: '13px', color: '#64748b', marginLeft: 'auto' }}>{ep.desc}</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', margin: '0 0 6px', textTransform: 'uppercase' }}>Parameters</p>
                    <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>{ep.params}</p>
                  </div>
                  <div style={{ flex: 2, minWidth: '300px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', margin: '0 0 6px', textTransform: 'uppercase' }}>Example Response</p>
                    <div style={{ background: '#0c1a2e', borderRadius: '8px', padding: '10px 14px' }}>
                      <code style={{ color: '#38bdf8', fontSize: '12px', wordBreak: 'break-all' }}>{ep.example}</code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Examples Tab */}
        {activeTab === 'examples' && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0f2fe' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 16px' }}>Code Examples</h3>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['curl', 'javascript', 'python'].map(lang => (
                <button key={lang} onClick={() => setCodeLang(lang)} style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid #e0f2fe', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: codeLang === lang ? '#0ea5e9' : '#fff', color: codeLang === lang ? '#fff' : '#64748b' }}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ background: '#0c1a2e', borderRadius: '12px', padding: '20px' }}>
              <pre style={{ color: '#e2e8f0', fontSize: '13px', margin: 0, lineHeight: 1.7, overflowX: 'auto' }}>{codeExamples[codeLang]}</pre>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}