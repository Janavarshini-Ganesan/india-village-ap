import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API_BASE = 'https://india-village-ap.vercel.app/api'
const api = axios.create({
  baseURL: API_BASE
})

api.interceptors.request.use((config) => {
  const apiKey =
    localStorage.getItem('apiKey') || 'ak_ad076ecf009c1574774aa1977b8e1957' // fallback

  config.headers['x-api-key'] = apiKey
  return config
})

export default function Demo() {
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', message: '',
    village: '', subDistrict: '', district: '', state: '', villageId: ''
  })
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searching, setSearching] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.get(`/v1/villages/search?q=${query}`)
        setSuggestions(res.data.data || [])
        setShowSuggestions(true)
      } catch (err) {
        console.error(err)
      } finally {
        setSearching(false)
      }
    }, 400)
  }, [query])

  const handleSelectVillage = (village) => {
    setForm({
      ...form,
      village: village.name,
      villageId: village.id,
      subDistrict: village.subDistrict?.name || '',
      district: village.subDistrict?.district?.name || '',
      state: village.subDistrict?.district?.state?.name || '',
    })
    setQuery(village.name)
    setShowSuggestions(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '24px', padding: '48px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 4px 40px rgba(0,0,0,0.06)' }}>
          <div style={{ width: '72px', height: '72px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px' }}>✅</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 12px' }}>Form Submitted!</h2>
          <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 8px', lineHeight: 1.7 }}>Your standardized address:</p>
          <div style={{ background: '#f0f9ff', borderRadius: '12px', padding: '16px', margin: '16px 0 32px' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#0369a1', margin: 0 }}>
              {form.village}, {form.subDistrict}, {form.district}, {form.state}, India
            </p>
          </div>
          <button
            onClick={() => { setSubmitted(false); setForm({ fullName: '', email: '', phone: '', message: '', village: '', subDistrict: '', district: '', state: '', villageId: '' }); setQuery('') }}
            style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 32px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
          >
            Submit Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0c1a2e, #1e1b4b)', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #38bdf8, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>IV</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>India Village API</span>
          <span style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>DEMO</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href="/login" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px' }}>Login</a>
          <a href="/register" style={{ background: '#0ea5e9', color: '#fff', padding: '8px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Get API Access</a>
        </div>
      </div>

      {/* Hero */}
      <div style={{ padding: '60px 40px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '20px', padding: '6px 16px', marginBottom: '20px' }}>
          <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 600 }}>🚀 Live API Demo — 590,532 Villages</span>
        </div>
        <h1 style={{ fontSize: '44px', fontWeight: 800, color: '#fff', margin: '0 0 16px', lineHeight: 1.2 }}>
          Village Autocomplete<br />
          <span style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Powered by India Village API</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', maxWidth: '520px', margin: '0 auto 48px', lineHeight: 1.7 }}>
          See how our API powers address forms with real-time village search across all Indian states.
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 40px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>

        {/* Contact Form */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '36px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 6px' }}>Contact Form</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 28px' }}>Powered by India Village API autocomplete</p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  required
                  style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0c1a2e' }}
                />
              </div>

              {/* Email + Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    required
                    style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0c1a2e' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 99999 99999"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0c1a2e' }}
                  />
                </div>
              </div>

              {/* Village Search */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Village / Area
                  <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', marginLeft: '8px' }}>API POWERED</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Type village name to search..."
                    value={query}
                    onChange={e => { setQuery(e.target.value); if (!e.target.value) setForm({ ...form, village: '', subDistrict: '', district: '', state: '', villageId: '' }) }}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    style={{ width: '100%', border: '1.5px solid #0ea5e9', borderRadius: '10px', padding: '10px 40px 10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0c1a2e' }}
                  />
                  {searching && (
                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', border: '2px solid #e2e8f0', borderTop: '2px solid #0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', zIndex: 100, maxHeight: '240px', overflowY: 'auto', marginTop: '4px' }}>
                    {suggestions.map((v, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelectVillage(v)}
                        style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#0c1a2e', margin: '0 0 2px' }}>{v.name}</p>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                          {v.subDistrict?.name}, {v.subDistrict?.district?.name}, {v.subDistrict?.district?.state?.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-filled address fields */}
              {form.village && (
                <div style={{ background: '#f0f9ff', borderRadius: '12px', padding: '16px', border: '1px solid #bae6fd' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>✨ Auto-filled from API</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { label: 'Sub-District', value: form.subDistrict },
                      { label: 'District', value: form.district },
                      { label: 'State', value: form.state },
                      { label: 'Country', value: 'India' },
                    ].map((field, i) => (
                      <div key={i}>
                        <p style={{ fontSize: '11px', color: '#0369a1', margin: '0 0 3px', fontWeight: 600 }}>{field.label}</p>
                        <p style={{ fontSize: '13px', color: '#0c1a2e', margin: 0, fontWeight: 500 }}>{field.value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #bae6fd' }}>
                    <p style={{ fontSize: '11px', color: '#0369a1', margin: '0 0 3px', fontWeight: 600 }}>Formatted Address</p>
                    <p style={{ fontSize: '13px', color: '#0369a1', margin: 0, fontWeight: 600 }}>
                      {form.village}, {form.subDistrict}, {form.district}, {form.state}, India
                    </p>
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Message</label>
                <textarea
                  placeholder="Your message..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  rows={3}
                  style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: '#0c1a2e', resize: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !form.village}
                style={{ width: '100%', background: form.village ? 'linear-gradient(135deg, #0ea5e9, #6366f1)' : '#e2e8f0', color: form.village ? '#fff' : '#94a3b8', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: form.village ? 'pointer' : 'not-allowed', transition: 'all 0.3s' }}
              >
                {loading ? 'Submitting...' : form.village ? 'Submit Form →' : 'Select a village to continue'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel — Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* How it works */}
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 20px' }}>How it works</h3>
            {[
              { step: '01', title: 'User types village name', desc: 'Minimum 2 characters triggers the API search', color: '#38bdf8' },
              { step: '02', title: 'API returns matches', desc: 'Real-time results from 590,532 villages across India', color: '#818cf8' },
              { step: '03', title: 'Address auto-fills', desc: 'Sub-district, district and state populate automatically', color: '#34d399' },
              { step: '04', title: 'Standardized format', desc: 'Village, Sub-Dist, District, State, India — ready to store', color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: i < 3 ? '20px' : 0 }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: s.color, opacity: 0.5, minWidth: '32px' }}>{s.step}</div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{s.title}</p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { value: '590K+', label: 'Villages', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
              { value: '34', label: 'States', color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
              { value: '591', label: 'Districts', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
              { value: '<100ms', label: 'Response Time', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            ].map((stat, i) => (
              <div key={i} style={{ background: stat.bg, borderRadius: '16px', padding: '20px', border: `1px solid ${stat.color}22`, textAlign: 'center' }}>
                <p style={{ fontSize: '28px', fontWeight: 800, color: stat.color, margin: '0 0 4px' }}>{stat.value}</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(14,165,233,0.2))', borderRadius: '20px', padding: '28px', border: '1px solid rgba(99,102,241,0.3)', textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Want this in your app?</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '0 0 20px' }}>Get API access and integrate in minutes</p>
            <a href="/register" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff', padding: '12px 28px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
              Get Free API Access →
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}