import { useState } from 'react'
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom'
import MarketingCorn from './pages/marketing/corn/index.jsx'
import MarketingCornProjection from './pages/marketing/corn/Projection.jsx'
import MarketingCornHedge from './pages/marketing/corn/HedgeTracker.jsx'
import MarketingCornElevator from './pages/marketing/corn/ElevatorPrices.jsx'
import MarketingSoybeans from './pages/marketing/soybeans/index.jsx'
import MarketingSoybeansProjection from './pages/marketing/soybeans/Projection.jsx'
import MarketingSoybeansHedge from './pages/marketing/soybeans/HedgeTracker.jsx'
import MarketingSoybeansElevator from './pages/marketing/soybeans/ElevatorPrices.jsx'

// ── Icons (inline SVG, no dep needed) ──────────────────────────
const IconMarketing = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
)
const IconChevron = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const IconCorn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22V12"/>
    <path d="M12 12C12 12 7 10 7 5c0 0 2.5 2 5 2s5-2 5-2c0 5-5 7-5 7z"/>
    <path d="M8 19c0 0 1-3 4-3s4 3 4 3"/>
  </svg>
)
const IconSoy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10"/>
    <path d="M12 2c2.5 2.5 4 6 4 10"/>
  </svg>
)

// ── Sidebar ─────────────────────────────────────────────────────
function Sidebar() {
  const [marketingOpen, setMarketingOpen] = useState(true)
  const [cornOpen, setCornOpen] = useState(true)
  const [soyOpen, setSoyOpen] = useState(false)
  const location = useLocation()

  const isCornActive = location.pathname.startsWith('/marketing/corn')
  const isSoyActive  = location.pathname.startsWith('/marketing/soybeans')

  return (
    <aside style={{
      width: 'var(--nav-width)',
      background: 'var(--bg-raised)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        height: 'var(--header-h)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 18px',
        borderBottom: '1px solid var(--border)',
        gap: 10,
      }}>
        <div style={{
          width: 28, height: 28,
          background: 'var(--gold)',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'Bebas Neue', fontSize: 16, color: '#0f0e0c', lineHeight: 1 }}>RZ</span>
        </div>
        <div>
          <div style={{ fontFamily: 'Bebas Neue', fontSize: 17, letterSpacing: 1, color: 'var(--gold)', lineHeight: 1 }}>Rocking Z</div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Acres</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>

        {/* Marketing section */}
        <div>
          {/* Marketing header — clickable to expand */}
          <button
            onClick={() => setMarketingOpen(o => !o)}
            style={{
              width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 18px',
              background: 'none', border: 'none',
              color: marketingOpen ? 'var(--gold)' : 'var(--text-muted)',
              fontSize: 12, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconMarketing />
              Marketing
            </span>
            <IconChevron open={marketingOpen} />
          </button>

          {marketingOpen && (
            <div>

              {/* Corn */}
              <button
                onClick={() => setCornOpen(o => !o)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 18px 7px 32px',
                  background: isCornActive ? 'var(--bg-hover)' : 'none',
                  border: 'none',
                  borderLeft: isCornActive ? '2px solid var(--gold)' : '2px solid transparent',
                  color: isCornActive ? 'var(--text)' : 'var(--text-muted)',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconCorn />
                  Corn
                </span>
                <IconChevron open={cornOpen} />
              </button>

              {cornOpen && (
                <div style={{ paddingLeft: 48 }}>
                  {[
                    { to: '/marketing/corn/projection', label: 'Projection Engine' },
                    { to: '/marketing/corn/hedge',      label: 'Hedge Tracker' },
                    { to: '/marketing/corn/elevator',   label: 'Elevator Prices' },
                  ].map(({ to, label }) => (
                    <NavLink key={to} to={to} style={({ isActive }) => ({
                      display: 'block',
                      padding: '6px 12px',
                      fontSize: 12,
                      color: isActive ? 'var(--gold-light)' : 'var(--text-muted)',
                      borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent',
                      background: isActive ? 'var(--bg-hover)' : 'none',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    })}>
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}

              {/* Soybeans */}
              <button
                onClick={() => setSoyOpen(o => !o)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '7px 18px 7px 32px',
                  background: isSoyActive ? 'var(--bg-hover)' : 'none',
                  border: 'none',
                  borderLeft: isSoyActive ? '2px solid var(--gold)' : '2px solid transparent',
                  color: isSoyActive ? 'var(--text)' : 'var(--text-muted)',
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconSoy />
                  Soybeans
                </span>
                <IconChevron open={soyOpen} />
              </button>

              {soyOpen && (
                <div style={{ paddingLeft: 48 }}>
                  {[
                    { to: '/marketing/soybeans/projection', label: 'Projection Engine' },
                    { to: '/marketing/soybeans/hedge',      label: 'Hedge Tracker' },
                    { to: '/marketing/soybeans/elevator',   label: 'Elevator Prices' },
                  ].map(({ to, label }) => (
                    <NavLink key={to} to={to} style={({ isActive }) => ({
                      display: 'block',
                      padding: '6px 12px',
                      fontSize: 12,
                      color: isActive ? 'var(--gold-light)' : 'var(--text-muted)',
                      borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent',
                      background: isActive ? 'var(--bg-hover)' : 'none',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    })}>
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

        {/* Placeholder sections — for later */}
        {['Fields', 'Operations', 'Equipment', 'Reports'].map(section => (
          <div key={section} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 18px',
            color: 'var(--text-dim)',
            fontSize: 12, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase',
            cursor: 'not-allowed',
            marginTop: 2,
          }}>
            <span style={{
              fontSize: 9, padding: '1px 5px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 3, color: 'var(--text-dim)', letterSpacing: 0.5,
            }}>soon</span>
            {section}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 18px',
        borderTop: '1px solid var(--border)',
        fontSize: 10,
        color: 'var(--text-dim)',
        fontFamily: 'DM Mono, monospace',
      }}>
        ROCKING Z ACRES · v1.0
      </div>
    </aside>
  )
}

// ── Header bar ──────────────────────────────────────────────────
function Header() {
  const location = useLocation()

  // Build readable breadcrumb from path
  const parts = location.pathname.split('/').filter(Boolean)
  const breadcrumb = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' › ')

  return (
    <header style={{
      height: 'var(--header-h)',
      background: 'var(--bg-raised)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>
      <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>
        {breadcrumb || 'Home'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'var(--text-dim)' }}>
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <div style={{
          width: 30, height: 30,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 600, color: 'var(--gold)',
        }}>
          CZ
        </div>
      </div>
    </header>
  )
}

// ── Home / landing ───────────────────────────────────────────────
function Home() {
  const navigate = useNavigate()
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100%', gap: 8,
    }}>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: 52, color: 'var(--gold)', letterSpacing: 3, lineHeight: 1 }}>
        Rocking Z Acres
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>
        Farm Management Platform
      </div>
      <button
        onClick={() => navigate('/marketing/corn/projection')}
        style={{
          padding: '12px 28px',
          background: 'var(--gold)',
          border: 'none',
          borderRadius: 6,
          color: '#0f0e0c',
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
          letterSpacing: 0.5,
        }}>
        Open Marketing →
      </button>
    </div>
  )
}

// ── Root App ─────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketing/corn" element={<MarketingCorn />} />
            <Route path="/marketing/corn/projection" element={<MarketingCornProjection />} />
            <Route path="/marketing/corn/hedge" element={<MarketingCornHedge />} />
            <Route path="/marketing/corn/elevator" element={<MarketingCornElevator />} />
            <Route path="/marketing/soybeans" element={<MarketingSoybeans />} />
            <Route path="/marketing/soybeans/projection" element={<MarketingSoybeansProjection />} />
            <Route path="/marketing/soybeans/hedge" element={<MarketingSoybeansHedge />} />
            <Route path="/marketing/soybeans/elevator" element={<MarketingSoybeansElevator />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
