import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      return setError('Passwords do not match')
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters')
    }

    setLoading(true)
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '48px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 4px 40px rgba(0,0,0,0.06)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 20px' }}>✅</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 10px' }}>Registration Successful!</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px', lineHeight: '1.6' }}>
            Your account is pending admin approval. You'll be able to login once approved.
          </p>
          <Link to="/login" style={{ display: 'inline-block', background: '#0ea5e9', color: '#fff', padding: '12px 32px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', display: 'flex', fontFamily: 'Inter, sans-serif' }}>

      {/* Left Panel */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #0c1a2e, #1e1b4b)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #38bdf8, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px' }}>IV</div>
          <span style={{ fontWeight: 700, fontSize: '18px' }}>India Village API</span>
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>
          Start building with<br />590K+ villages
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', margin: '0 0 40px', lineHeight: 1.7 }}>
          Get access to India's complete geographical data — states, districts, sub-districts and villages — through a simple REST API.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { icon: '⚡', text: 'Sub-100ms response time' },
            { icon: '🔒', text: 'Secure API key authentication' },
            { icon: '📊', text: 'Usage analytics dashboard' },
            { icon: '🌍', text: 'All 34 states covered' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 6px' }}>Create your account</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 28px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Business Name</label>
                <input
                  type="text"
                  placeholder="Acme Corporation"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0c1a2e', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Business Email</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0c1a2e', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0c1a2e', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  required
                  style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0c1a2e', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
                />
              </div>

              {/* Password strength */}
              {form.password && (
                <div>
                  <div style={{ height: '4px', borderRadius: '4px', background: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '4px', transition: 'all 0.3s',
                      width: form.password.length < 6 ? '25%' : form.password.length < 8 ? '50%' : form.password.length < 12 ? '75%' : '100%',
                      background: form.password.length < 6 ? '#ef4444' : form.password.length < 8 ? '#f59e0b' : form.password.length < 12 ? '#0ea5e9' : '#22c55e'
                    }}></div>
                  </div>
                  <p style={{ fontSize: '12px', color: form.password.length < 8 ? '#f59e0b' : '#22c55e', margin: '4px 0 0' }}>
                    {form.password.length < 6 ? 'Too weak' : form.password.length < 8 ? 'Almost there' : form.password.length < 12 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1, marginTop: '8px' }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
                By registering, your account will be reviewed by our team before activation.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}