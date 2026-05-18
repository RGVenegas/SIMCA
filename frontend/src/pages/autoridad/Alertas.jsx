import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import MetricCard from '../../components/MetricCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { fetchJSON, formatDate, postJSON } from '../../utils/api'

export default function Alertas() {
  const [alertas, setAlertas] = useState(null)
  const [resolvingId, setResolvingId] = useState(null)

  async function cargar() {
    const d = await fetchJSON('/autoridad/alertas')
    setAlertas(d)
  }

  async function resolver(id) {
    setResolvingId(id)
    try {
      await postJSON(`/autoridad/alertas/${id}/resolver`)
      await cargar()
    } finally {
      setResolvingId(null)
    }
  }

  function exportCSV() {
    const rows = [['timestamp', 'nodo', 'sector', 'tipo', 'mensaje', 'sms', 'estado']]
    alertas.forEach(a => rows.push([
      a.created_at, a.node_id, a.sector_id, a.type, a.message,
      a.sms_sent ? 'si' : 'no', a.is_active ? 'activa' : 'resuelta'
    ]))
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `simca_alertas_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  useEffect(() => {
    cargar()
    const id = setInterval(cargar, 15000)
    return () => clearInterval(id)
  }, [])

  if (!alertas) return (
    <>
      <Navbar rol="autoridad" />
      <div className="container"><LoadingSpinner /></div>
    </>
  )

  const activas   = alertas.filter(a => a.is_active).length
  const criticas  = alertas.filter(a => a.is_active && a.level === 'CRITICAL').length
  const warnings  = alertas.filter(a => a.is_active && a.level === 'WARNING').length
  const resueltas = alertas.filter(a => !a.is_active && a.resolved_at && new Date(a.resolved_at).toDateString() === new Date().toDateString()).length

  return (
    <>
      <Navbar rol="autoridad" />
      <div className="container">
        <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
          <MetricCard label="ALERTAS ACTIVAS" value={activas}   cls={activas > 0 ? 'card-alert' : 'card'} />
          <MetricCard label="CRÍTICAS"         value={criticas}  cls={criticas > 0 ? 'card-alert' : 'card'} />
          <MetricCard label="WARNING"          value={warnings}  cls={warnings > 0 ? 'card-warn' : 'card'} />
          <MetricCard label="RESUELTAS HOY"    value={resueltas} cls="card-cyan" />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.65rem', letterSpacing: '3px', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>ALERTAS ACTIVAS</div>
          {alertas.filter(a => a.is_active).length === 0 ? (
            <div className="card" style={{ borderColor: 'var(--safe)' }}>
              <div style={{ color: 'var(--safe)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem', textAlign: 'center', padding: '2rem' }}>✓ Sin alertas activas — sistema operando con normalidad</div>
            </div>
          ) : alertas.filter(a => a.is_active).map(a => (
            <div key={a.id} style={{ background: '#06101a', borderLeft: `4px solid ${a.level === 'WARNING' ? 'var(--warning)' : 'var(--critical)'}`, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span className={a.level === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}>{a.level}</span>
                  <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.7rem', color: 'var(--cyan)', letterSpacing: '1px' }}>{a.node_id}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>·</span>
                  <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>{a.sector_id}</span>
                </div>
                <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '0.95rem', color: 'var(--text)' }}>{a.message}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Tipo: {a.type} · SMS: {a.sms_sent ? '✓ enviado' : '—'} · {formatDate(a.created_at)}
                </div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => resolver(a.id)} disabled={resolvingId === a.id}>{resolvingId === a.id ? 'RESOLVIENDO...' : 'RESOLVER'}</button>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.65rem', letterSpacing: '3px', color: 'var(--text-muted)' }}>HISTORIAL COMPLETO</div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-outline btn-sm" onClick={exportCSV}>CSV</button>
              <button className="btn btn-outline btn-sm" onClick={() => window.print()}>PDF</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>TIMESTAMP</th><th>NODO</th><th>SECTOR</th><th>TIPO</th>
                  <th>VALOR</th><th>SMS</th><th>ESTADO</th><th>ACCIÓN</th>
                </tr>
              </thead>
              <tbody>
                {alertas.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Sin registros</td></tr>
                ) : alertas.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(a.created_at)}</td>
                    <td style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.7rem', color: 'var(--cyan)' }}>{a.node_id}</td>
                    <td style={{ fontFamily: "'Rajdhani',sans-serif", color: 'var(--text)' }}>{a.sector_id}</td>
                    <td style={{ fontFamily: "'Rajdhani',sans-serif", color: 'var(--text)' }}>{a.type}</td>
                    <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', color: 'var(--text)' }}>{a.message}</td>
                    <td><span style={{ color: a.sms_sent ? 'var(--safe)' : 'var(--text-muted)' }}>{a.sms_sent ? '✓ SMS' : '—'}</span></td>
                    <td><span className={a.is_active ? 'badge-critical' : 'badge-safe'}>{a.is_active ? 'ACTIVA' : 'RESUELTA'}</span></td>
                    <td>
                      {a.is_active
                        ? <button className="btn btn-danger btn-sm" onClick={() => resolver(a.id)} disabled={resolvingId === a.id}>{resolvingId === a.id ? 'RESOLVIENDO...' : 'RESOLVER'}</button>
                        : <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.65rem', color: 'var(--text-muted)' }}>{a.resolved_at ? formatDate(a.resolved_at) : '—'}</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <footer className="footer">SIMCA v5.0 · SEREMI Región de Valparaíso · 2026</footer>
    </>
  )
}
