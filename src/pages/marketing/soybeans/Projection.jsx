// import SoybeanProjectionEngine from './SoybeanProjectionEngine'

export default function SoybeansProjection() {
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
        🫘
      </div>
      <div style={{ fontSize: 20, fontFamily: 'Bebas Neue', letterSpacing: 1, color: 'var(--gold)' }}>
        Soybean Projection Engine
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', maxWidth: 400, lineHeight: 1.6 }}>
        Drop your soybean projection <code style={{ fontFamily: 'DM Mono', color: 'var(--gold-light)', fontSize: 11 }}>.jsx</code> file
        into <code style={{ fontFamily: 'DM Mono', color: 'var(--gold-light)', fontSize: 11 }}>src/pages/marketing/soybeans/</code>,
        rename it to <code style={{ fontFamily: 'DM Mono', color: 'var(--gold-light)', fontSize: 11 }}>SoybeanProjectionEngine.jsx</code>,
        then uncomment the import in this file.
      </div>
    </div>
  )
}
