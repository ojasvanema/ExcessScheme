import { useState, useEffect, useRef } from 'react'
import NetworkCanvas from '../components/NetworkCanvas'
import Sparkles from '../components/Sparkles'
import ThemeToggle from '../components/ThemeToggle'
import LoginModal from '../components/LoginModal'

const STATS = [
  { val: '2.4M+', label: 'Tokens Minted' },
  { val: '₹840Cr', label: 'Distributed' },
  { val: '99.97%', label: 'Uptime' },
  { val: '0', label: 'Frauds Passed' },
]

const FEATURES = [
  { icon:'🔗', title:'Blockchain Tokenisation', desc:'Every rupee of government scholarship is minted as a cryptographic token on-chain — immutable, auditable, and tamper-proof.', featured:true },
  { icon:'🤖', title:'AI Fraud Detection', desc:'7-layer AI pipeline verifies identity, detects forgery, checks duplicates and cross-references income in real time before any fund release.' },
  { icon:'🌉', title:'Bridge Student Model', desc:'A single bridge student atomically collects the full batch and distributes individual tokens — gas-efficient and fully traceable.' },
  { icon:'🏛️', title:'Gov Control Panel', desc:'Officers tokenize schemes, review AI-verified applications, resolve fraud flags, and download immutable audit reports.' },
  { icon:'🎓', title:'Student Portal', desc:'Students apply, track status, verify identity, hold tokens in a wallet, and redeem directly to their bank — all in one dashboard.' },
  { icon:'📊', title:'Real-Time Audit', desc:'Every token state transition is recorded on-chain. Transparent dashboards let the public verify fund flows without exposing student data.' },
]

const STEPS = [
  { num:'01', icon:'🏛️', title:'Gov Creates Scheme', desc:'Officer defines criteria, budget, and deadline. Funds are locked in a smart contract.' },
  { num:'02', icon:'📝', title:'Student Applies', desc:'Student submits application with documents through the portal.' },
  { num:'03', icon:'🤖', title:'AI Verifies', desc:'7-step AI pipeline verifies identity, documents, and eligibility.' },
  { num:'04', icon:'🔗', title:'Tokens Minted', desc:'Approved students receive cryptographic scholarship tokens.' },
  { num:'05', icon:'💸', title:'Bridge Distributes', desc:'Bridge student atomically distributes tokens to all verified recipients.' },
]

export default function Landing() {
  const [loginRole, setLoginRole] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const countersRef = useRef(null)
  const [counters, setCounters] = useState(STATS.map(() => 0))
  const animatedRef = useRef(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = countersRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animatedRef.current) {
        animatedRef.current = true
        animateCounters()
      }
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const animateCounters = () => {
    const targets = [2400000, 840, 99.97, 0]
    const duration = 2000
    const steps = 60
    let step = 0
    const interval = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      setCounters(targets.map(t => Math.round(t * eased * 100) / 100))
      if (step >= steps) clearInterval(interval)
    }, duration / steps)
  }

  const formatCounter = (val, idx) => {
    if (idx === 0) return (val >= 1000000 ? (val / 1000000).toFixed(1) + 'M+' : val.toLocaleString())
    if (idx === 1) return '₹' + val + 'Cr'
    if (idx === 2) return val.toFixed(2) + '%'
    return '0'
  }

  return (
    <div>
      <NetworkCanvas />
      <Sparkles />
      {/* ambient bg orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* NAVBAR */}
      <nav className="navbar" style={scrolled ? { borderBottomColor:'var(--border)' } : {}}>
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="brand-icon">⚡</span>
            ExpressScheme
          </div>
          <div className="nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <a href="#ai">AI Verify</a>
            <a href="#login" className="btn-nav">Launch App →</a>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Blockchain × AI × Government Schemes
          </div>
          <h1 className="hero-title">
            Scholarship Funds.<br />
            <span className="gradient-text">Tokenised.<br/>Verified.<br/>Distributed.</span>
          </h1>
          <p className="hero-sub">
            Blockchain-powered. AI-verified. Fraud-proof.
          </p>
          <div className="hero-cta">
            <button className="btn-primary" onClick={() => setLoginRole('gov')}>🏛️ Gov Officer Login</button>
            <button className="btn-ghost"   onClick={() => setLoginRole('user')}>🎓 Student Portal</button>
          </div>
          <div className="hero-stats" ref={countersRef}>
            {STATS.map((s, i) => (
              <div className="stat" key={i}>
                <span className="stat-val">{formatCounter(counters[i], i)}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="token-orb">
            <div className="orb-ring ring1"></div>
            <div className="orb-ring ring2"></div>
            <div className="orb-ring ring3"></div>
            <div className="orb-core">
              <span className="orb-icon">⚡</span>
              <span className="orb-label">EXPRESS<br/>TOKEN</span>
            </div>
            <div className="floating-card fc1"><span className="fc-icon">🔗</span><span>On-Chain</span></div>
            <div className="floating-card fc2"><span className="fc-icon">🤖</span><span>AI Verified</span></div>
            <div className="floating-card fc3"><span className="fc-icon">🛡️</span><span>Fraud-Proof</span></div>
            <div className="floating-card fc4"><span className="fc-icon">💸</span><span>Instant Payout</span></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section section-dark" id="how-it-works">
        <div className="container">
          <p className="section-label" style={{ textAlign:'center' }}>How It Works</p>
          <h2 className="section-title">Five Steps to Transparent Scholarship</h2>
          <p className="section-sub">
            From government treasury to student wallet — every step recorded on the blockchain.
          </p>
          <div className="steps-flow">
            {STEPS.map((s, i) => (
              <>
                <div className="step-card" key={s.num}>
                  <div className="step-num">STEP {s.num}</div>
                  <div className="step-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && <div className="step-arrow" key={`arr-${i}`}>→</div>}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="container">
          <p className="section-label" style={{ textAlign:'center' }}>Platform Features</p>
          <h2 className="section-title">Everything You Need for Fraud-Free Disbursement</h2>
          <p className="section-sub">Built for scale, trust, and total transparency.</p>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className={`feature-card glow-card${f.featured ? ' featured' : ''}`}>
                {f.featured && <div className="feature-glow"></div>}
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <a href="#" className="feature-link">Learn more →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section className="section section-dark" id="ai">
        <div className="container">
          <div className="ai-split">
            <div className="ai-text">
              <p className="section-label">AI Verification</p>
              <h2 className="section-title" style={{ textAlign:'left' }}>
                7-Layer AI Pipeline That Never Sleeps
              </h2>
              <p>
                Before any token is issued, our AI runs every application through a
                rigorous pipeline — OCR extraction, identity cross-reference, forgery
                detection, duplicate check, income validation, and on-chain anchoring.
              </p>
              <p>
                Powered by vector embeddings, image forensics, and real-time database
                cross-reference — zero false payouts.
              </p>
              <ul className="ai-checks">
                {['Document OCR & Forgery Detection','Identity Biometric Cross-Reference','Duplicate Application Screening','Income Validation with PAN/ITR','On-Chain Cryptographic Proof Anchoring'].map(c => (
                  <li key={c}><span className="check">✓</span>{c}</li>
                ))}
              </ul>
            </div>
            <div className="ai-card">
              <div className="ai-card-header">
                <span className="ai-dot green"></span>
                AI Engine — Live Scan
              </div>
              <div className="ai-scan">
                {[
                  { label:'Aadhaar Identity Match', result:'✓ Verified', type:'verified' },
                  { label:'Income Certificate OCR', result:'✓ Authentic', type:'verified' },
                  { label:'Academic Marks Sheet', result:'⚠ Low Confidence', type:'warning' },
                  { label:'Bank Account Validation', result:'✓ Linked', type:'verified' },
                ].map(item => (
                  <div key={item.label} className={`scan-item ${item.type}`}>
                    <span className="scan-label">{item.label}</span>
                    <span className="scan-result">{item.result}</span>
                  </div>
                ))}
              </div>
              <div className="trust-score">
                <span>Trust Score</span>
                <div className="score-bar"><div className="score-fill" style={{ width:'87%' }}></div></div>
                <span className="score-val">87 / 100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGIN CARDS */}
      <section className="section login-section" id="login">
        <div className="container">
          <p className="section-label" style={{ textAlign:'center' }}>Access Portal</p>
          <h2 className="section-title">Choose Your Role</h2>
          <p className="section-sub">
            Two portals, one platform — built for government officers and students alike.
          </p>
          <div className="login-cards">
            <div className="login-card glow-card login-gov" onClick={() => setLoginRole('gov')}>
              <div className="lcard-bg"></div>
              <div className="lcard-icon">🏛️</div>
              <h3>Government Officer</h3>
              <p>Create and tokenize scholarship schemes, review applications, resolve fraud flags, and download audit reports.</p>
              <ul className="lcard-list">
                {['Tokenize Scheme Funds','Review Applications','AI Fraud Flags','Audit Reports'].map(i => (
                  <li key={i}><span>▶</span>{i}</li>
                ))}
              </ul>
              <div className="lcard-btn"><span>Login as Gov Officer</span><span>→</span></div>
            </div>
            <div className="login-card glow-card login-user" onClick={() => setLoginRole('user')}>
              <div className="lcard-bg"></div>
              <div className="lcard-icon">🎓</div>
              <h3>Student / Applicant</h3>
              <p>Browse government schemes, apply, verify your documents with AI, track token wallet, and use bridge mode.</p>
              <ul className="lcard-list">
                {['Apply for Schemes','AI Self-Verify','Token Wallet','Bridge Mode'].map(i => (
                  <li key={i}><span>▶</span>{i}</li>
                ))}
              </ul>
              <div className="lcard-btn"><span>Login as Student</span><span>→</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="nav-brand brand-name">⚡ ExpressScheme</div>
            <p>Tokenised government scholarship distribution powered by blockchain and AI.</p>
          </div>
          <div className="footer-links">
            <div className="fl-col">
              <span className="fl-head">Platform</span>
              <a href="#">Gov Portal</a>
              <a href="#">Student Portal</a>
              <a href="#">AI Verify</a>
            </div>
            <div className="fl-col">
              <span className="fl-head">Legal</span>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Use</a>
              <a href="#">Data Protection</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 ExpressScheme. Built for Hackathon. All rights reserved.
        </div>
      </footer>

      <LoginModal role={loginRole} onClose={() => setLoginRole(null)} />
    </div>
  )
}
