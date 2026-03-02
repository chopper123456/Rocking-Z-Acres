export default function CornHedgeTracker() {
  return (
    <div style={{
      padding: 32,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: 16,
    }}>
      <div style={{
        width: 64, height: 64,
        border: '2px dashed var(--border-light)',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28,
      }}>
        📊
      </div>
      <div style={{ fontSize: 20, fontFamily: 'Bebas Neue', letterSpacing: 1, color: 'var(--gold)' }}>
        Corn Hedge Tracker
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
        Coming soon — build your hedge tracking tool and drop it in here.
      </div>
    </div>
  )
}
