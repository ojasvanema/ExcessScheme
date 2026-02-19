/**
 * WalletDashboard.jsx — Algorand TestNet Wallet Dashboard
 *
 * Features:
 *   • Connect / disconnect Pera Wallet (WalletConnect)
 *   • Auto-reconnect on page refresh
 *   • ALGO balance display
 *   • Recent 10 transactions
 *   • Owned ASAs + NFTs with metadata
 *   • Clear loading / error / empty states
 *   • "TestNet" badge — prevents MainNet confusion
 *
 * Security:
 *   • NEVER handles private keys or mnemonics
 *   • Address treated as public data only
 *   • All signing goes through Pera Wallet app
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import {
  connectWallet,
  disconnectWallet,
  reconnectWallet,
  loadAddress,
} from '../lib/perawallet'
import {
  getAccountInfo,
  getRecentTransactions,
  getEnrichedAssets,
  getNetworkStatus,
  shortAddr,
  microToAlgo,
  fmtDate,
} from '../lib/algorand'
import '../styles/wallet.css'

// ─── Demo address (pre-loaded in view-only mode) ─────────────────────────────
const DEMO_ADDRESS = 'JN6CWSZOAYYVHJSGXLVXP5ESHQRQXBGH55MY6HHTAOYY7ACF3JY2SWJ4DU'

// ─── Transaction type labels ─────────────────────────────────────────────────
const TX_LABELS = {
  pay:   { label: 'Payment',        icon: '💸', color: '#00e8c6' },
  axfer: { label: 'Asset Transfer', icon: '🪙', color: '#a78bfa' },
  appl:  { label: 'App Call',       icon: '⚙️',  color: '#fbbf24' },
  acfg:  { label: 'Asset Config',   icon: '🔧', color: '#f87171' },
  afrz:  { label: 'Asset Freeze',   icon: '🧊', color: '#60a5fa' },
  keyreg:{ label: 'Key Reg',        icon: '🔑', color: '#34d399' },
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WalletDashboard() {
  const navigate = useNavigate()

  // Connection state
  const [address,     setAddress]     = useState(null)
  const [isDemo,      setIsDemo]      = useState(false)   // true = view-only demo
  const [connecting,  setConnecting]  = useState(false)
  const [connError,   setConnError]   = useState(null)

  // Dashboard data
  const [account,     setAccount]     = useState(null)
  const [txns,        setTxns]        = useState([])
  const [assets,      setAssets]      = useState([])
  const [network,     setNetwork]     = useState(null)

  // Loading / error per panel
  const [loadingAcct, setLoadingAcct] = useState(false)
  const [loadingTxns, setLoadingTxns] = useState(false)
  const [loadingAsts, setLoadingAsts] = useState(false)
  const [acctError,   setAcctError]   = useState(null)
  const [txnsError,   setTxnsError]   = useState(null)

  // Active tab
  const [tab, setTab] = useState('overview')  // overview | transactions | assets

  // ── Copy address to clipboard ─────────────────────────────────────────────
  const [copied, setCopied] = useState(false)
  const copyAddress = () => {
    if (!address) return
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Fetch all dashboard data for a given address ──────────────────────────
  const fetchData = useCallback(async (addr) => {
    // Account info
    setLoadingAcct(true)
    setAcctError(null)
    try {
      const info = await getAccountInfo(addr)
      setAccount(info)
    } catch (e) {
      setAcctError('Could not load account info. The address may not exist on TestNet yet.')
    } finally {
      setLoadingAcct(false)
    }

    // Transactions
    setLoadingTxns(true)
    setTxnsError(null)
    try {
      const txList = await getRecentTransactions(addr, 10)
      setTxns(txList)
    } catch (e) {
      setTxnsError('Could not load recent transactions.')
    } finally {
      setLoadingTxns(false)
    }

    // Network status (fire and forget)
    getNetworkStatus().then(setNetwork).catch(() => {})
  }, [])

  // Fetch enriched assets when account data arrives
  useEffect(() => {
    if (!account || !account.assets || account.assets.length === 0) {
      setAssets([])
      return
    }
    setLoadingAsts(true)
    getEnrichedAssets(account.assets)
      .then(setAssets)
      .catch(() => setAssets([]))
      .finally(() => setLoadingAsts(false))
  }, [account])

  // ── On mount: try to reconnect or load demo ────────────────────────────────
  useEffect(() => {
    async function init() {
      // Try WalletConnect session restore
      try {
        const addr = await reconnectWallet()
        if (addr) {
          setAddress(addr)
          setIsDemo(false)
          fetchData(addr)
          return
        }
      } catch { /* no session */ }

      // Fall back to demo address (view-only)
      setAddress(DEMO_ADDRESS)
      setIsDemo(true)
      fetchData(DEMO_ADDRESS)
    }
    init()
  }, [fetchData])

  // ── Connect wallet ────────────────────────────────────────────────────────
  async function handleConnect() {
    setConnecting(true)
    setConnError(null)
    try {
      const addr = await connectWallet()
      setAddress(addr)
      setIsDemo(false)
      fetchData(addr)
    } catch (e) {
      // USER_REJECTED_REQUEST or similar
      if (e?.message?.includes('rejected') || e?.message?.includes('cancel')) {
        setConnError('Connection cancelled. Open Pera Wallet and try again.')
      } else if (e?.message?.includes('No accounts')) {
        setConnError('No accounts found. Make sure Pera Wallet is unlocked.')
      } else {
        setConnError(e?.message ?? 'Connection failed. Is Pera Wallet installed?')
      }
    } finally {
      setConnecting(false)
    }
  }

  // ── Disconnect wallet ────────────────────────────────────────────────────
  async function handleDisconnect() {
    await disconnectWallet()
    setAddress(DEMO_ADDRESS)
    setIsDemo(true)
    setAccount(null)
    setTxns([])
    setAssets([])
    fetchData(DEMO_ADDRESS)
  }

  // ── Refresh data ──────────────────────────────────────────────────────────
  function handleRefresh() {
    if (address) fetchData(address)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="wd-root">

      {/* ── Navbar ────────────────────────────────────── */}
      <nav className="wd-nav">
        <div className="wd-nav-inner">
          <div className="wd-nav-brand" onClick={() => navigate('/')}>
            <span>⚡</span> ExpressScheme
          </div>
          <div className="wd-nav-right">
            <span className="wd-testnet-badge">TESTNET</span>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="wd-container">

        {/* ── Page header ───────────────────────────── */}
        <div className="wd-header">
          <div>
            <h1 className="wd-title">
              <span className="wd-title-icon">◎</span> Algorand Wallet
            </h1>
            <p className="wd-subtitle">
              {isDemo
                ? 'Viewing demo address — connect your wallet for full access'
                : 'Connected via Pera Wallet on TestNet'}
            </p>
          </div>
          <div className="wd-header-actions">
            {!isDemo ? (
              <button className="wd-btn wd-btn-ghost" onClick={handleDisconnect}>
                ⏏ Disconnect
              </button>
            ) : (
              <button
                className="wd-btn wd-btn-primary"
                onClick={handleConnect}
                disabled={connecting}
              >
                {connecting ? (
                  <><span className="wd-spinner" /> Connecting…</>
                ) : (
                  '🔗 Connect Pera Wallet'
                )}
              </button>
            )}
            <button className="wd-btn wd-btn-ghost" onClick={handleRefresh} title="Refresh">
              ↺
            </button>
          </div>
        </div>

        {/* ── Connection error banner ─────────────────── */}
        {connError && (
          <div className="wd-error-banner">
            ⚠ {connError}
            <button onClick={() => setConnError(null)}>✕</button>
          </div>
        )}

        {/* ── Demo banner ─────────────────────────────── */}
        {isDemo && (
          <div className="wd-demo-banner">
            <span>👁 View-only mode — showing demo address</span>
            <code>{shortAddr(DEMO_ADDRESS)}</code>
            <span>Connect Pera Wallet to use your own account.</span>
          </div>
        )}

        {/* ── Address card ────────────────────────────── */}
        <div className="wd-address-card">
          <div className="wd-address-left">
            <div className="wd-avatar">
              {address ? address.slice(0, 2) : '??'}
            </div>
            <div>
              <div className="wd-address-label">Wallet Address</div>
              <div className="wd-address-full">
                <code title={address}>{address ?? '—'}</code>
              </div>
              <div className="wd-address-short">{address ? shortAddr(address) : '—'}</div>
            </div>
          </div>
          <div className="wd-address-right">
            <button className="wd-copy-btn" onClick={copyAddress} disabled={!address}>
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
            {network?.lastRound && (
              <div className="wd-block-info">
                Block <strong>#{network.lastRound.toLocaleString()}</strong>
              </div>
            )}
          </div>
        </div>

        {/* ── Tab navigation ───────────────────────────── */}
        <div className="wd-tabs">
          {[
            { id: 'overview',     label: '◈ Overview'     },
            { id: 'transactions', label: '⇄ Transactions' },
            { id: 'assets',       label: '🪙 Assets'       },
          ].map(t => (
            <button
              key={t.id}
              className={`wd-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            TAB: OVERVIEW
        ══════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <div className="wd-overview">

            {/* ALGO Balance card */}
            <div className="wd-stat-card wd-stat-algo">
              <div className="wd-stat-label">ALGO Balance</div>
              {loadingAcct ? (
                <div className="wd-skeleton wd-skeleton-lg" />
              ) : acctError ? (
                <div className="wd-stat-error">—</div>
              ) : (
                <>
                  <div className="wd-stat-value">
                    {account?.balance ?? '0.0000'}
                    <span className="wd-stat-unit">ALGO</span>
                  </div>
                  <div className="wd-stat-sub">
                    Min balance: {account?.minBalance ?? '0'} ALGO
                  </div>
                </>
              )}
            </div>

            {/* Asset count card */}
            <div className="wd-stat-card">
              <div className="wd-stat-label">Assets (ASA / NFT)</div>
              {loadingAcct ? (
                <div className="wd-skeleton wd-skeleton-lg" />
              ) : (
                <>
                  <div className="wd-stat-value">
                    {account?.assets?.length ?? 0}
                    <span className="wd-stat-unit">held</span>
                  </div>
                  <div className="wd-stat-sub">
                    NFTs: {assets.filter(a => a.isNFT).length}
                  </div>
                </>
              )}
            </div>

            {/* Transaction count card */}
            <div className="wd-stat-card">
              <div className="wd-stat-label">Recent Txns</div>
              {loadingTxns ? (
                <div className="wd-skeleton wd-skeleton-lg" />
              ) : (
                <>
                  <div className="wd-stat-value">
                    {txns.length}
                    <span className="wd-stat-unit">loaded</span>
                  </div>
                  <div className="wd-stat-sub">Last 10 on TestNet</div>
                </>
              )}
            </div>

            {/* Status card */}
            <div className="wd-stat-card">
              <div className="wd-stat-label">Node Status</div>
              <div className="wd-stat-value wd-stat-status">
                <span className="wd-online-dot" /> Online
              </div>
              <div className="wd-stat-sub">AlgoNode TestNet</div>
            </div>

            {acctError && (
              <div className="wd-panel-error" style={{ gridColumn:'1/-1' }}>
                ⚠ {acctError}
              </div>
            )}

            {/* Latest 3 transactions preview */}
            {txns.length > 0 && (
              <div className="wd-preview-panel" style={{ gridColumn:'1/-1' }}>
                <div className="wd-panel-header">
                  Recent Activity
                  <button className="wd-see-all" onClick={() => setTab('transactions')}>
                    See all →
                  </button>
                </div>
                {txns.slice(0, 3).map(tx => (
                  <TxnRow key={tx.id} tx={tx} myAddress={address} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: TRANSACTIONS
        ══════════════════════════════════════════════ */}
        {tab === 'transactions' && (
          <div className="wd-panel">
            <div className="wd-panel-header">
              Last 10 Transactions
              <span className="wd-panel-count">{txns.length}</span>
            </div>

            {loadingTxns && (
              <>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="wd-skeleton wd-skeleton-row" />
                ))}
              </>
            )}

            {!loadingTxns && txnsError && (
              <div className="wd-panel-error">{txnsError}</div>
            )}

            {!loadingTxns && !txnsError && txns.length === 0 && (
              <div className="wd-empty">
                <span className="wd-empty-icon">⇄</span>
                <p>No transactions found for this address on TestNet.</p>
                <small>Use the <a href="https://bank.testnet.algorand.network/" target="_blank" rel="noreferrer">TestNet Faucet</a> to fund your wallet.</small>
              </div>
            )}

            {!loadingTxns && txns.map(tx => (
              <TxnRow key={tx.id} tx={tx} myAddress={address} />
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB: ASSETS
        ══════════════════════════════════════════════ */}
        {tab === 'assets' && (
          <div className="wd-panel">
            <div className="wd-panel-header">
              Held Assets
              <span className="wd-panel-count">{assets.length}</span>
            </div>

            {(loadingAcct || loadingAsts) && (
              <>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="wd-skeleton wd-skeleton-row" />
                ))}
              </>
            )}

            {!loadingAcct && !loadingAsts && assets.length === 0 && (
              <div className="wd-empty">
                <span className="wd-empty-icon">🪙</span>
                <p>No ASAs or NFTs found for this address.</p>
                <small>Opt-in to an asset on TestNet to see it here.</small>
              </div>
            )}

            {!loadingAcct && !loadingAsts && assets.map(ast => (
              <AssetRow key={ast.assetId} asset={ast} />
            ))}
          </div>
        )}

        {/* ── Footer ───────────────────────────────────── */}
        <div className="wd-footer">
          <span className="wd-testnet-badge">TESTNET</span>
          Data from{' '}
          <a href="https://algonode.io" target="_blank" rel="noreferrer">AlgoNode</a>
          {' · '}
          <a href="https://bank.testnet.algorand.network/" target="_blank" rel="noreferrer">
            Get TestNet ALGO →
          </a>
          {' · '}
          <a href="https://testnet.algoexplorer.io" target="_blank" rel="noreferrer">
            AlgoExplorer
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Single transaction row */
function TxnRow({ tx, myAddress }) {
  const meta    = TX_LABELS[tx.type] ?? { label: tx.type, icon: '◈', color: '#9ca3af' }
  const isOutbound = tx.sender === myAddress
  const counterparty = tx.receiver ?? tx.assetRcv ?? '—'

  return (
    <div className="wd-txn-row">
      <div className="wd-txn-icon" style={{ color: meta.color }}>{meta.icon}</div>
      <div className="wd-txn-info">
        <div className="wd-txn-type">{meta.label}</div>
        <div className="wd-txn-parties">
          {isOutbound
            ? <>To: <code>{shortAddr(counterparty)}</code></>
            : <>From: <code>{shortAddr(tx.sender)}</code></>}
        </div>
        <div className="wd-txn-date">{fmtDate(tx.roundTime)}</div>
      </div>
      <div className="wd-txn-amount">
        {tx.type === 'pay' ? (
          <span className={isOutbound ? 'wd-neg' : 'wd-pos'}>
            {isOutbound ? '−' : '+'}{microToAlgo(tx.amount)} ALGO
          </span>
        ) : tx.type === 'axfer' && tx.assetId ? (
          <span className="wd-asset-amt">
            {tx.assetAmt} <small>ASA#{tx.assetId}</small>
          </span>
        ) : (
          <span className="wd-neutral">—</span>
        )}
        <div className="wd-txn-fee">fee: {microToAlgo(tx.fee)} ALGO</div>
        <a
          className="wd-txn-link"
          href={`https://testnet.algoexplorer.io/tx/${tx.id}`}
          target="_blank"
          rel="noreferrer"
        >
          View ↗
        </a>
      </div>
    </div>
  )
}

/** Single asset row */
function AssetRow({ asset }) {
  return (
    <div className="wd-asset-row">
      <div className="wd-asset-icon">
        {asset.isNFT ? '🖼' : '🪙'}
      </div>
      <div className="wd-asset-info">
        <div className="wd-asset-name">
          {asset.name}
          {asset.isNFT && <span className="wd-nft-badge">NFT</span>}
        </div>
        <div className="wd-asset-meta">
          Unit: <strong>{asset.unitName}</strong>
          {' · '}
          ID: <a
            href={`https://testnet.algoexplorer.io/asset/${asset.assetId}`}
            target="_blank"
            rel="noreferrer"
          >
            #{asset.assetId}
          </a>
          {asset.url && (
            <>{' · '}<a href={asset.url} target="_blank" rel="noreferrer" className="wd-asset-url">🔗 Metadata</a></>
          )}
        </div>
      </div>
      <div className="wd-asset-balance">
        <div className="wd-asset-amount">{asset.displayAmount.toLocaleString()}</div>
        <div className="wd-asset-unit">{asset.unitName}</div>
        {asset.frozen && <div className="wd-frozen-badge">🧊 Frozen</div>}
      </div>
    </div>
  )
}
