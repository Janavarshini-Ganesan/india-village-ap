import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

const PLANS = [
  { id: 'free', name: 'Free', price: '$0/mo', limit: '5,000 req/day', color: '#475569', bg: '#f1f5f9', features: ['Single state access', 'Basic support', 'API documentation'] },
  { id: 'premium', name: 'Premium', price: '$49/mo', limit: '50,000 req/day', color: '#166534', bg: '#dcfce7', features: ['Up to 5 states', 'Email support', 'Usage analytics'] },
  { id: 'pro', name: 'Pro', price: '$199/mo', limit: '300,000 req/day', color: '#1e40af', bg: '#dbeafe', features: ['All states access', 'Priority support', 'Advanced analytics'] },
  { id: 'unlimited', name: 'Unlimited', price: '$499/mo', limit: '1,000,000 req/day', color: '#7e22ce', bg: '#fae8ff', features: ['All states', 'Dedicated support', 'SLA guarantee'] },
]

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1 = plan, 2 = details
  const [selectedPlan, setSelectedPlan] = useState('free')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 8) return setError('Password must be at least 8 characters')
    setLoading(true)
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        planType: selectedPlan
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
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', margin: '16px 0 24px' }}>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px' }}>Selected Plan</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#1e1b4b', margin: 0 }}>{PLANS.find(p => p.id === selectedPlan)?.name}</p>
          </div>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px', lineHeight: '1.6' }}>
            Your account is pending admin approval. You'll be notified by email once approved.
          </p>
          <Link to="/login" style={{ display: 'inline-block', background: '#0ea5e9', color: '#fff', padding: '12px 32px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0c1a2e, #1e1b4b)', fontFamily: 'Inter, sans-serif', padding: '40px 20px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #38bdf8, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', color: '#fff' }}>IV</div>
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#fff' }}>India Village API</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Create your account</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', margin: 0 }}>Already have an account? <Link to="/login" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link></p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
        {[{ n: 1, label: 'Choose Plan' }, { n: 2, label: 'Your Details' }].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= s.n ? '#0ea5e9' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px' }}>{s.n}</div>
              <span style={{ fontSize: '14px', color: step >= s.n ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: step >= s.n ? 600 : 400 }}>{s.label}</span>
            </div>
            {i === 0 && <div style={{ width: '40px', height: '2px', background: step >= 2 ? '#0ea5e9' : 'rgba(255,255,255,0.1)', borderRadius: '2px' }}></div>}
          </div>
        ))}
      </div>

      {/* Step 1 — Plan Selection */}
      {step === 1 && (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                style={{ background: selectedPlan === plan.id ? '#fff' : 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', border: `2px solid ${selectedPlan === plan.id ? '#0ea5e9' : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
              >
                {plan.id === 'pro' && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#0ea5e9', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>Most Popular</div>
                )}
                <p style={{ fontSize: '18px', fontWeight: 800, color: selectedPlan === plan.id ? '#1e1b4b' : '#fff', margin: '0 0 4px' }}>{plan.name}</p>
                <p style={{ fontSize: '24px', fontWeight: 800, color: selectedPlan === plan.id ? '#0ea5e9' : '#38bdf8', margin: '0 0 4px' }}>{plan.price}</p>
                <p style={{ fontSize: '12px', color: selectedPlan === plan.id ? '#64748b' : 'rgba(255,255,255,0.5)', margin: '0 0 16px' }}>{plan.limit}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: selectedPlan === plan.id ? '#0ea5e9' : '#38bdf8', fontSize: '12px' }}>✓</span>
                      <span style={{ fontSize: '12px', color: selectedPlan === plan.id ? '#475569' : 'rgba(255,255,255,0.6)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                {selectedPlan === plan.id && (
                  <div style={{ marginTop: '16px', background: '#0ea5e9', color: '#fff', borderRadius: '8px', padding: '6px', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}>✓ Selected</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setStep(2)}
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px 48px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}
            >
              Continue with {PLANS.find(p => p.id === selectedPlan)?.name} →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Details Form */}
      {step === 2 && (
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '36px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

            {/* Selected plan badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '12px 16px', background: '#f0f9ff', borderRadius: '10px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Selected Plan</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0c1a2e' }}>{PLANS.find(p => p.id === selectedPlan)?.name}</span>
                <button onClick={() => setStep(1)} style={{ fontSize: '12px', color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Change</button>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Business Name</label>
                  <input type="text" placeholder="Acme Corporation" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0c1a2e', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Business Email</label>
                  <input type="email" placeholder="you@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0c1a2e', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Password</label>
                  <input type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0c1a2e', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Confirm Password</label>
                  <input type="password" placeholder="Repeat your password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#0c1a2e', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }} />
                </div>
                {form.password && (
                  <div>
                    <div style={{ height: '4px', borderRadius: '4px', background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '4px', transition: 'all 0.3s', width: form.password.length < 6 ? '25%' : form.password.length < 8 ? '50%' : form.password.length < 12 ? '75%' : '100%', background: form.password.length < 6 ? '#ef4444' : form.password.length < 8 ? '#f59e0b' : form.password.length < 12 ? '#0ea5e9' : '#22c55e' }}></div>
                    </div>
                    <p style={{ fontSize: '12px', color: form.password.length < 8 ? '#f59e0b' : '#22c55e', margin: '4px 0 0' }}>
                      {form.password.length < 6 ? 'Too weak' : form.password.length < 8 ? 'Almost there' : form.password.length < 12 ? 'Good' : 'Strong'}
                    </p>
                  </div>
                )}
                <button type="submit" disabled={loading} style={{ width: '100%', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1, marginTop: '8px' }}>
                  {loading ? 'Creating account...' : 'Create Account →'}
                </button>
                <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
                  Account will be reviewed before activation
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}