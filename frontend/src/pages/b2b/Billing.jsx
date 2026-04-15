import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../utils/api'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    display: '$0',
    period: 'forever',
    limit: '5,000',
    burst: '100/min',
    color: '#475569',
    bg: '#f1f5f9',
    border: '#e2e8f0',
    features: [
      'Single state access',
      '5,000 requests/day',
      'Basic support',
      'API documentation',
      'Community access'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49,
    display: '$49',
    period: 'per month',
    limit: '50,000',
    burst: '500/min',
    color: '#166534',
    bg: '#dcfce7',
    border: '#86efac',
    features: [
      'Up to 5 states access',
      '50,000 requests/day',
      'Email support',
      'Usage analytics',
      'Priority queue'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 199,
    display: '$199',
    period: 'per month',
    limit: '300,000',
    burst: '2,000/min',
    color: '#1e40af',
    bg: '#dbeafe',
    border: '#93c5fd',
    popular: true,
    features: [
      'All states access',
      '300,000 requests/day',
      'Priority support',
      'Advanced analytics',
      'SLA 99.9% uptime'
    ]
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: 499,
    display: '$499',
    period: 'per month',
    limit: '1,000,000',
    burst: '5,000/min',
    color: '#7e22ce',
    bg: '#fae8ff',
    border: '#d8b4fe',
    features: [
      'All states access',
      '1M requests/day',
      'Dedicated support',
      'Custom SLA',
      'Invoice billing'
    ]
  }
]

const Sidebar = ({ handleLogout }) => (
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
        { icon: '💳', label: 'Billing & Plans', path: '/dashboard/billing', active: true },
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
      <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', borderRadius: '10px', background: 'transparent', color: 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', fontSize: '14px' }}>↩ Logout</button>
    </div>
  </aside>
)

export default function B2BBilling() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [upgrading, setUpgrading] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newPlan, setNewPlan] = useState(null)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const { data: profile } = useQuery({
    queryKey: ['b2b-profile'],
    queryFn: async () => {
      const res = await api.get('/auth/me')
      return res.data.data
    }
  })

  const currentPlan = PLANS.find(p => p.id === profile?.planType) || PLANS[0]

  // This mutation will call backend to upgrade plan
  // When Razorpay is added, payment verification happens here first
  const upgradeMutation = useMutation({
    mutationFn: async (planId) => {
      // TODO: Add Razorpay payment here before upgrading
      // const order = await api.post('/payments/create-order', { planId })
      // const payment = await razorpay.open(order)
      // await api.post('/payments/verify', { payment, planId })

      // For now — direct upgrade (remove this when Razorpay is added)
      const res = await api.post('/b2b/upgrade-plan', { planType: planId })
      return res.data
    },
    onSuccess: (_, planId) => {
      setNewPlan(PLANS.find(p => p.id === planId))
      setShowSuccess(true)
      setUpgrading(null)
      queryClient.invalidateQueries(['b2b-profile'])
    },
    onError: () => {
      setUpgrading(null)
    }
  })

  const handleUpgrade = (planId) => {
    if (planId === profile?.planType) return
    setUpgrading(planId)
    upgradeMutation.mutate(planId)
  }

  const getPlanRank = (planId) => ['free', 'premium', 'pro', 'unlimited'].indexOf(planId)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f9ff', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar handleLogout={handleLogout} />
      <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>

        {/* Success Banner */}
        {showSuccess && (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>🎉</span>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#166534', margin: 0 }}>Plan upgraded to {newPlan?.name}!</p>
                <p style={{ fontSize: '13px', color: '#16a34a', margin: '2px 0 0' }}>Your new limits are active immediately.</p>
              </div>
            </div>
            <button onClick={() => setShowSuccess(false)} style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', fontSize: '18px' }}>×</button>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0c1a2e', margin: 0 }}>Billing & Plans</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '14px' }}>Manage your subscription and upgrade your plan</p>
        </div>

        {/* Current Plan Banner */}
        <div style={{ background: 'linear-gradient(135deg, #0c1a2e, #1e1b4b)', borderRadius: '20px', padding: '28px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Plan</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <p style={{ fontSize: '32px', fontWeight: 800, color: '#fff', margin: 0 }}>{currentPlan.name}</p>
              <span style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8', fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px' }}>Active</span>
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>{currentPlan.limit} requests/day • {currentPlan.burst} burst limit</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>Billing</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8', margin: 0 }}>{currentPlan.display}</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{currentPlan.period}</p>
          </div>
        </div>

        {/* Plans Grid */}
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 20px' }}>Available Plans</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {PLANS.map((plan) => {
            const isCurrent = plan.id === profile?.planType
            const isUpgrade = getPlanRank(plan.id) > getPlanRank(profile?.planType)
            const isDowngrade = getPlanRank(plan.id) < getPlanRank(profile?.planType)
            const isLoading = upgrading === plan.id

            return (
              <div key={plan.id} style={{ background: '#fff', borderRadius: '20px', padding: '24px', border: `2px solid ${isCurrent ? '#0ea5e9' : plan.border}`, position: 'relative', transition: 'all 0.2s' }}>

                {/* Popular badge */}
                {plan.popular && !isCurrent && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#0ea5e9', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', whiteSpace: 'nowrap' }}>Most Popular</div>
                )}

                {/* Current badge */}
                {isCurrent && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#0ea5e9', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', whiteSpace: 'nowrap' }}>✓ Current Plan</div>
                )}

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: '#0c1a2e', margin: '0 0 4px' }}>{plan.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <p style={{ fontSize: '32px', fontWeight: 800, color: plan.id === 'free' ? '#475569' : '#0ea5e9', margin: 0 }}>{plan.display}</p>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>{plan.period}</p>
                  </div>
                </div>

                <div style={{ background: plan.bg, borderRadius: '10px', padding: '10px 14px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: plan.color, margin: '0 0 2px' }}>{plan.limit} req/day</p>
                  <p style={{ fontSize: '12px', color: plan.color, margin: 0, opacity: 0.8 }}>Burst: {plan.burst}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#0ea5e9', fontSize: '12px', fontWeight: 700 }}>✓</span>
                      <span style={{ fontSize: '13px', color: '#475569' }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                {isCurrent ? (
                  <div style={{ width: '100%', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, textAlign: 'center' }}>
                    Current Plan
                  </div>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isLoading}
                    style={{ width: '100%', background: isLoading ? '#e2e8f0' : 'linear-gradient(135deg, #0ea5e9, #6366f1)', color: isLoading ? '#94a3b8' : '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}
                  >
                    {isLoading ? 'Processing...' : `Upgrade to ${plan.name} →`}
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isLoading}
                    style={{ width: '100%', background: '#fff', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Downgrade to {plan.name}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Razorpay Coming Soon Notice */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0f2fe', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <span style={{ fontSize: '32px' }}>💳</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 4px' }}>Payment Integration Coming Soon</p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Razorpay payment gateway will be integrated for Premium, Pro and Unlimited plans. For now, plan upgrades are processed manually by our team.</p>
          </div>
          <div style={{ background: '#fef9c3', color: '#854d0e', fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '20px', whiteSpace: 'nowrap' }}>Coming Soon</div>
        </div>

        {/* FAQ */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e0f2fe' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 20px' }}>Frequently Asked Questions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { q: 'When does my plan take effect?', a: 'Plan changes take effect immediately. Your rate limits update instantly.' },
              { q: 'Can I downgrade my plan?', a: 'Yes, you can downgrade at any time. Your limits will adjust immediately.' },
              { q: 'What happens if I exceed my daily limit?', a: 'API requests will return a 429 rate limit error until the next day reset at midnight UTC.' },
              { q: 'Is there a free trial for paid plans?', a: 'The Free plan is available forever with no credit card required. Contact us for a paid plan trial.' },
            ].map((faq, i) => (
              <div key={i} style={{ paddingBottom: '16px', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#0c1a2e', margin: '0 0 6px' }}>Q: {faq.q}</p>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>A: {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}