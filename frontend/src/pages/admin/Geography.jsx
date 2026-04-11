import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../utils/api'

const Sidebar = ({ handleLogout }) => (
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
            { icon: '🗺️', label: 'Geography', path: '/admin/geography', active: true  },
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

export default function AdminGeography() {
  const navigate = useNavigate()
  const [selectedState, setSelectedState] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedSubDistrict, setSelectedSubDistrict] = useState('')
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const { data: states } = useQuery({
    queryKey: ['admin-geo-states'],
    queryFn: async () => {
      const res = await api.get('/admin/geography/states')
      return res.data.data
    }
  })

  const { data: districts } = useQuery({
    queryKey: ['admin-geo-districts', selectedState],
    enabled: !!selectedState,
    queryFn: async () => {
      const res = await api.get(`/admin/geography/districts?stateId=${selectedState}`)
      return res.data.data
    }
  })

  const { data: subdistricts } = useQuery({
    queryKey: ['admin-geo-subdistricts', selectedDistrict],
    enabled: !!selectedDistrict,
    queryFn: async () => {
      const res = await api.get(`/admin/geography/subdistricts?districtId=${selectedDistrict}`)
      return res.data.data
    }
  })

  const { data: villages } = useQuery({
    queryKey: ['admin-geo-villages', selectedSubDistrict],
    enabled: !!selectedSubDistrict,
    queryFn: async () => {
      const res = await api.get(`/admin/geography/villages?subDistrictId=${selectedSubDistrict}`)
      return res.data.data
    }
  })

  const { data: searchResults } = useQuery({
    queryKey: ['admin-geo-search', searchQuery],
    enabled: searchQuery.length >= 2,
    queryFn: async () => {
      const res = await api.get(`/admin/geography/search?q=${searchQuery}`)
      return res.data.data
    }
  })

  const selectStyle = { width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', color: '#475569', outline: 'none', background: '#fff' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar handleLogout={handleLogout} />
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e1b4b', margin: 0 }}>Geography Browser</h1>
          <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '14px' }}>Explore and verify the imported geographical data</p>
        </div>

        {/* Search */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #f1f5f9', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '0 0 12px' }}>Search Villages</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              placeholder="Type village name (min 2 chars)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setSearchQuery(search)}
              style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', color: '#475569', outline: 'none' }}
            />
            <button
              onClick={() => setSearchQuery(search)}
              style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              Search
            </button>
          </div>
          {searchResults && searchQuery && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {searchResults.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>No villages found</p>
              ) : searchResults.map((v, i) => (
                <div key={i} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: '0 0 2px' }}>{v.name}</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                    {v.subDistrict?.name} → {v.subDistrict?.district?.name} → {v.subDistrict?.district?.state?.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hierarchical Browser */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '0 0 20px' }}>Hierarchical Browser</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>State</label>
              <select style={selectStyle} value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedDistrict(''); setSelectedSubDistrict('') }}>
                <option value="">Select State</option>
                {states?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {selectedState && <p style={{ fontSize: '12px', color: '#6366f1', margin: '6px 0 0' }}>{districts?.length || 0} districts</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>District</label>
              <select style={selectStyle} value={selectedDistrict} onChange={e => { setSelectedDistrict(e.target.value); setSelectedSubDistrict('') }} disabled={!selectedState}>
                <option value="">Select District</option>
                {districts?.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {selectedDistrict && <p style={{ fontSize: '12px', color: '#6366f1', margin: '6px 0 0' }}>{subdistricts?.length || 0} sub-districts</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Sub-District</label>
              <select style={selectStyle} value={selectedSubDistrict} onChange={e => setSelectedSubDistrict(e.target.value)} disabled={!selectedDistrict}>
                <option value="">Select Sub-District</option>
                {subdistricts?.map(sd => <option key={sd.id} value={sd.id}>{sd.name}</option>)}
              </select>
              {selectedSubDistrict && <p style={{ fontSize: '12px', color: '#6366f1', margin: '6px 0 0' }}>{villages?.length || 0} villages</p>}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              {selectedSubDistrict && (
                <div style={{ background: '#ede9fe', borderRadius: '12px', padding: '12px 16px', width: '100%' }}>
                  <p style={{ fontSize: '12px', color: '#6d28d9', margin: '0 0 4px' }}>Villages found</p>
                  <p style={{ fontSize: '28px', fontWeight: 800, color: '#6366f1', margin: 0 }}>{villages?.length || 0}</p>
                </div>
              )}
            </div>
          </div>

          {villages && villages.length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: '0 0 12px' }}>Villages</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                {villages.map((v, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', margin: '0 0 2px' }}>{v.name}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Code: {v.code}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}