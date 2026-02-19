import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import StatusBadge from '../components/StatusBadge'
import ThemeToggle from '../components/ThemeToggle'
import { SCHEMES, MY_TOKENS, MY_APPLICATIONS, BRIDGE_BATCH, BRIDGE_RECIPIENTS } from '../data/dashboardData'

const TABS = [
  { id:'overview',     icon:'📊', label:'My Overview' },
  { id:'browse',       icon:'🔍', label:'Browse Schemes' },
  { id:'applications', icon:'📝', label:'My Applications' },
  { id:'tokens',       icon:'💎', label:'My Tokens' },
  { id:'verify',       icon:'🤖', label:'AI Verify Me' },
  { id:'bridge',       icon:'🌉', label:'Bridge Mode' },
]

const TIMELINE = [
  { icon:'✅', title:'Application Submitted', desc:'PM National Scholarship 2026', time:'Feb 16, 2026', state:'done' },
  { icon:'✅', title:'AI Verification Passed', desc:'Score: 87/100 — All checks passed', time:'Feb 16, 2026', state:'done' },
  { icon:'✅', title:'Gov Officer Approved', desc:'Approved by Officer OFF-2026-001', time:'Feb 17, 2026', state:'done' },
  { icon:'⏳', title:'Token Minting in Progress', desc:'Awaiting batch mint confirmation', time:'Pending', state:'pending' },
  { icon:'⬜', title:'Token Received in Wallet', desc:'Will appear in My Tokens', time:'—', state:'waiting' },
]

const AI_STEPS = [
  { icon:'📤', label:'Document Upload', desc:'Upload Aadhaar, Marksheet, Income Certificate, Bank Statement' },
  { icon:'🔍', label:'OCR Extraction', desc:'AI extracts and parses all text from uploaded documents' },
  { icon:'🪪', label:'Identity Cross-Reference', desc:'Aadhaar data cross-referenced with UIDAI database' },
  { icon:'🖼️', label:'Forgery Detection', desc:'ML model scans for pixel manipulation, metadata anomalies' },
  { icon:'📋', label:'Duplicate Check', desc:'Vector DB search for duplicate identities across all applications' },
  { icon:'💰', label:'Income Validation', desc:'Stated income verified against PAN/ITR records' },
  { icon:'⛓️', label:'On-Chain Anchoring', desc:'Verification hash anchored immutably to blockchain' },
]

function TrustGauge({ score = 87 }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')
    c.width = 200; c.height = 120
    const cx=100, cy=108, r=80
    ctx.clearRect(0,0,200,120)
    ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI,2*Math.PI); ctx.strokeStyle='rgba(255,255,255,.06)'; ctx.lineWidth=12; ctx.stroke()
    const end = Math.PI + (score/100)*Math.PI
    const g = ctx.createLinearGradient(0,0,200,0)
    g.addColorStop(0,'#EF4444'); g.addColorStop(.5,'#F59E0B'); g.addColorStop(1,'#00E8C6')
    ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI,end); ctx.strokeStyle=g; ctx.lineWidth=12; ctx.lineCap='round'; ctx.stroke()
  }, [score])
  return (
    <div className="trust-gauge">
      <div className="gauge-wrap">
        <canvas ref={canvasRef} style={{ display:'block' }} />
        <div className="gauge-val" style={{ bottom:'8px' }}>{score}<span>/100</span></div>
      </div>
    </div>
  )
}

export default function UserDashboard() {
  const [tab, setTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024)
  const [browseFilter, setBrowseFilter] = useState('')
  const [tokens, setTokens] = useState(MY_TOKENS)
  const [applyModal, setApplyModal] = useState(null)
  const [verifyRunning, setVerifyRunning] = useState(false)
  const [verifyStep, setVerifyStep] = useState(-1)
  const [verifyDone, setVerifyDone] = useState(false)
  const [distributed, setDistributed] = useState(false)
  const navigate = useNavigate()

  const filteredSchemes = SCHEMES.filter(s =>
    s.status === 'active' && (!browseFilter || s.name.toLowerCase().includes(browseFilter.toLowerCase()))
  )

  const runVerify = () => {
    setVerifyRunning(true); setVerifyDone(false); setVerifyStep(0)
    let i = 0
    const iv = setInterval(() => {
      i++
      setVerifyStep(i)
      if (i >= AI_STEPS.length) { clearInterval(iv); setVerifyDone(true); setVerifyRunning(false) }
    }, 900)
  }

  return (
    <div className="dash-body">
      <Sidebar
        role="user"
        tabs={TABS}
        activeTab={tab}
        onTabChange={id => { setTab(id); if (window.innerWidth <= 1024) setSidebarOpen(false) }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="dash-main">
        {/* TOPBAR */}
        <div className="dash-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(o=>!o)}>☰</button>
            <span className="topbar-title">Student Portal</span>
          </div>
          <div className="topbar-right">
            <div className="verify-status"><span className="chain-dot"></span>AI Verified</div>
            <ThemeToggle />
          </div>
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="tab-content active">
            <div className="dash-welcome">
              <div>
                <h1>Welcome back, Priya 👋</h1>
                <p>Your scholarship journey at a glance.</p>
              </div>
              <span className="welcome-date">STU-2026-0042</span>
            </div>
            <div className="kpi-grid">
              {[
                { label:'Active Applications', val:'3', icon:'📝', cls:'kpi-accent' },
                { label:'Tokens Received', val:'2', icon:'💎', cls:'' },
                { label:'Total Scholarship', val:'₹80,000', icon:'💰', cls:'' },
                { label:'Trust Score', val:'87/100', icon:'🛡️', cls:'kpi-accent' },
                { label:'Pending Tokens', val:'1', icon:'⏳', cls:'kpi-warn' },
                { label:'Redeemed', val:'₹0', icon:'✅', cls:'' },
              ].map(k => (
                <div key={k.label} className={`kpi-card${k.cls?' '+k.cls:''}`}>
                  <div className="kpi-top">
                    <span className="kpi-label">{k.label}</span>
                    <span className="kpi-icon">{k.icon}</span>
                  </div>
                  <span className="kpi-val">{k.val}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'1.4rem' }}>
              <div className="table-card" style={{ padding:'1.6rem' }}>
                <span className="chart-title">Application Timeline</span>
                <div className="timeline">
                  {TIMELINE.map(t => (
                    <div key={t.title} className="tl-item">
                      <div className={`tl-dot ${t.state}`}>{t.icon}</div>
                      <div>
                        <div className="tl-title">{t.title}</div>
                        <div className="tl-desc">{t.desc}</div>
                        <div className="tl-time">{t.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="table-card" style={{ padding:'1.6rem', textAlign:'center' }}>
                <span className="chart-title">Trust Score</span>
                <TrustGauge score={87} />
                <div className="gauge-checks" style={{ marginTop:'1rem' }}>
                  {[
                    { label:'Identity', val:'Verified', ok:true },
                    { label:'Documents', val:'Authentic', ok:true },
                    { label:'Income', val:'Confirmed', ok:true },
                    { label:'Duplicates', val:'None Found', ok:true },
                  ].map(g => (
                    <div key={g.label} className="gc-item">
                      <span className="gc-label">{g.label}</span>
                      <span className={`gc-val ${g.ok?'ok':'warn'}`}>{g.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BROWSE */}
        {tab === 'browse' && (
          <div className="tab-content active">
            <div className="tab-header-row">
              <div><h2>Browse Schemes</h2><p>Find and apply for government scholarships.</p></div>
            </div>
            <div className="filter-bar">
              <input
                className="filter-input"
                placeholder="Search schemes…"
                value={browseFilter}
                onChange={e => setBrowseFilter(e.target.value)}
              />
              <select className="filter-select">
                <option>All Categories</option>
                <option>Merit</option>
                <option>Need-Based</option>
              </select>
            </div>
            <div className="schemes-grid">
              {filteredSchemes.map(s => (
                <div key={s.id} className="scheme-card">
                  <div className="sc-header">
                    <span className="sc-title">{s.name}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="sc-body">{s.criteria}</p>
                  <div className="sc-meta">
                    <span>💰 ₹{s.amount.toLocaleString()}</span>
                    <span>📅 {s.deadline}</span>
                  </div>
                  <div className="sc-footer">
                    <div className="sc-progress">
                      <div className="sc-progress-bar">
                        <div className="sc-progress-fill" style={{ width:`${s.filled}%` }}></div>
                      </div>
                      <span className="sc-pct">{s.filled}% filled</span>
                    </div>
                    <button className="btn-sm btn-approve" onClick={() => setApplyModal(s)}>
                      Apply →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MY APPLICATIONS */}
        {tab === 'applications' && (
          <div className="tab-content active">
            <div className="tab-header-row">
              <div><h2>My Applications</h2><p>Track your scholarship applications.</p></div>
            </div>
            <div className="apps-list">
              {MY_APPLICATIONS.map(a => (
                <div key={a.id} className="my-app-card">
                  <div>
                    <div className="mac-scheme">{a.scheme}</div>
                    <div className="mac-date">{a.date}</div>
                  </div>
                  <StatusBadge status={a.status} />
                  <div className="mac-amount">₹{a.amount.toLocaleString()}</div>
                  <button className="btn-sm btn-view">View Details</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MY TOKENS */}
        {tab === 'tokens' && (
          <div className="tab-content active">
            <div className="tab-header-row">
              <div><h2>My Token Wallet</h2><p>Your scholarship tokens.</p></div>
              <div>
                <span style={{ color:'var(--accent)', fontWeight:700, fontSize:'1.2rem' }}>
                  Total: ₹{tokens.filter(t=>t.status!=='redeemed').reduce((s,t)=>s+t.amount,0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="tokens-wallet">
              {tokens.map(t => (
                <div key={t.id} className={`token-card ${t.status}`}>
                  <div className="tc-scheme">{t.scheme}</div>
                  <div className="tc-amount">₹{t.amount.toLocaleString()}</div>
                  <div className="tc-id">{t.id}</div>
                  <div className="tc-meta">
                    Issued: {t.issued}<br/>
                    Expires: {t.expires}
                  </div>
                  <StatusBadge status={t.status} />
                  {t.status === 'redeemable' && (
                    <button
                      className="btn-sm btn-approve"
                      style={{ marginTop:'.8rem', width:'100%' }}
                      onClick={() => setTokens(prev => prev.map(x => x.id===t.id ? {...x,status:'redeemed'} : x))}
                    >
                      Redeem to Bank
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI VERIFY */}
        {tab === 'verify' && (
          <div className="tab-content active">
            <div className="tab-header-row">
              <div><h2>AI Verify Me</h2><p>Run your identity through the 7-step AI pipeline.</p></div>
            </div>
            <div className="ai-verify-layout">
              <div className="verify-steps-card">
                <h3>Verification Pipeline</h3>
                <div className="vsteps">
                  {AI_STEPS.map((s, i) => (
                    <div
                      key={s.label}
                      className={`vstep${verifyStep > i ? ' done' : verifyStep === i ? ' active' : ''}`}
                    >
                      <span className="vstep-icon">{verifyStep > i ? '✅' : s.icon}</span>
                      <div>
                        <div className="vstep-title">{s.label}</div>
                        <div className="vstep-desc">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {!verifyRunning && !verifyDone && (
                  <button className="btn-primary w-full" style={{ marginTop:'1.2rem' }} onClick={runVerify}>
                    🤖 Start AI Verification
                  </button>
                )}
                {verifyRunning && (
                  <div style={{ textAlign:'center', marginTop:'1rem', color:'var(--accent)' }}>
                    Processing step {verifyStep + 1} of {AI_STEPS.length}…
                  </div>
                )}
              </div>
              <div className="verify-progress-card">
                <h3>Verification Status</h3>
                {verifyDone ? (
                  <>
                    <TrustGauge score={87} />
                    <div className="verify-result success" style={{ marginTop:'1rem' }}>
                      ✅ Verification Passed — Score: 87/100
                    </div>
                    <div style={{ fontSize:'.78rem', color:'var(--text-2)', marginTop:'.8rem', lineHeight:1.6 }}>
                      Your identity has been verified on-chain.<br/>
                      <span style={{ color:'var(--accent)', fontFamily:'monospace' }}>
                        TX: 0x{Math.random().toString(16).slice(2,18).toUpperCase()}
                      </span>
                    </div>
                    <button
                      className="btn-primary w-full"
                      style={{ marginTop:'1rem' }}
                      onClick={() => navigate('/ai-verify')}
                    >
                      View Full AI Report →
                    </button>
                  </>
                ) : (
                  <div style={{ color:'var(--text-2)', fontSize:'.9rem', paddingTop:'1rem' }}>
                    Click "Start AI Verification" to run the full pipeline on your documents.
                    <br/><br/>
                    You'll need: Aadhaar, Marksheet, Income Certificate, Bank Statement.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BRIDGE MODE */}
        {tab === 'bridge' && (
          <div className="tab-content active">
            <div className="tab-header-row">
              <div><h2>Bridge Mode</h2><p>Collect and distribute tokens as bridge student.</p></div>
            </div>
            <div className="bridge-layout">
              <div className="bridge-info-card">
                <div className="bi-icon">🌉</div>
                <h3>Bridge Student Role</h3>
                <p>
                  As bridge student, you receive the full token batch and atomically distribute
                  to all verified recipients in a single on-chain transaction.
                </p>
                <br/>
                <div className="batch-info-grid">
                  <div className="big-item"><span className="big-l">Batch ID</span><span className="big-v">{BRIDGE_BATCH.batchId}</span></div>
                  <div className="big-item"><span className="big-l">Scheme</span><span className="big-v" style={{ fontSize:'.75rem' }}>{BRIDGE_BATCH.scheme}</span></div>
                  <div className="big-item"><span className="big-l">Tokens</span><span className="big-v">{BRIDGE_BATCH.total.toLocaleString()}</span></div>
                  <div className="big-item"><span className="big-l">Total Value</span><span className="big-v" style={{ color:'var(--accent)' }}>{BRIDGE_BATCH.amount}</span></div>
                </div>
              </div>
              <div className="bridge-panel">
                <div className="bridge-distribute-card">
                  <h3>Recipient List</h3>
                  {BRIDGE_RECIPIENTS.map(r => (
                    <div key={r.id} className="dist-item">
                      <div>
                        <div style={{ fontWeight:600, color:'var(--text)' }}>{r.name}</div>
                        <div style={{ fontSize:'.72rem', color:'var(--text-3)', fontFamily:'monospace' }}>{r.id}</div>
                      </div>
                      <div style={{ color:'var(--accent)', fontWeight:700 }}>₹{r.amount.toLocaleString()}</div>
                      <span className={`di-status ${r.status}`}>{r.status === 'verified' ? '✓ Verified' : '⏳ Pending'}</span>
                    </div>
                  ))}
                </div>
                {!distributed ? (
                  <button
                    className="btn-primary w-full"
                    onClick={() => setDistributed(true)}
                  >
                    🌉 Distribute All Tokens
                  </button>
                ) : (
                  <div style={{ background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.3)', borderRadius:'10px', padding:'1rem', textAlign:'center', color:'var(--success)', fontWeight:700 }}>
                    ✅ All tokens distributed on-chain!
                    <div style={{ fontSize:'.75rem', color:'var(--text-3)', fontFamily:'monospace', marginTop:'.5rem' }}>
                      TX: 0x{Math.random().toString(16).slice(2,18).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* APPLY MODAL */}
      {applyModal && (
        <div className="modal-overlay open" onClick={e=>e.target===e.currentTarget&&setApplyModal(null)}>
          <div className="modal-box" style={{ maxWidth:'500px' }}>
            <button className="modal-close" onClick={() => setApplyModal(null)}>✕</button>
            <div className="modal-title">Apply — {applyModal.name}</div>
            <div className="modal-sub">Amount: ₹{applyModal.amount?.toLocaleString()} · Deadline: {applyModal.deadline}</div>
            <div className="modal-form">
              <div className="form-group"><label>Full Name</label><input type="text" defaultValue="Priya Kumari" /></div>
              <div className="form-group"><label>Student ID</label><input type="text" defaultValue="STU-2026-0042" /></div>
              <div className="form-group"><label>Institution</label><input type="text" placeholder="Your college/school" /></div>
              <div className="form-group"><label>Family Annual Income (₹)</label><input type="number" placeholder="Enter income" /></div>
              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => { alert('Application submitted! AI verification will begin automatically.'); setApplyModal(null) }}
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
