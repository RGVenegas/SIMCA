import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import MetricCard from '../../components/MetricCard'
import Badge from '../../components/Badge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { fetchJSON, formatDate, formatPh } from '../../utils/api'

export default function Sensores() {
  const [nodos, setNodos] = useState(null)
  const [filtro, setFiltro] = useState('ALL')

  async function cargar() {
    const d = await fetchJSON('/autoridad/sensores')
    setNodos(d)
  }

  useEffect(() => {
    cargar()
    const id = setInterval(cargar, 15000)
    return () => clearInterval(id)
  }, [])

  if (!nodos) return (
    <>
      <Navbar rol="autoridad" />
      <div className="container"><LoadingSpinner /></div>
    </>
  )

  const filtrados = filtro === 'ALL' ? nodos : nodos.filter(n => n.status === filtro)
  const online  = nodos.filter(n => n.status === 'ONLINE').length
  const warning = nodos.filter(n => n.status === 'WARNING').length
  const offline = nodos.filter(n => n.status === 'OFFLINE').length
  const lowbat  = nodos.filter(n => (n.battery_percent ?? 100) < 15).length

  return (
    <>
      <Navbar rol="autoridad" />
      <div className="container">
        <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
          <MetricCard label="ONLINE"       value={online}  cls="card-cyan" />
          <MetricCard label="WARNING"      value={warning} cls={warning > 0 ? 'card-warn' : 'card'} />
          <MetricCard label="OFFLINE"      value={offline} cls={offline > 0 ? 'card-alert' : 'card'} />
          <MetricCard label="BATERÍA BAJA" value={lowbat}  cls={lowbat > 0 ? 'card-warn' : 'card'} />
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.6rem', letterSpacing: '3px', color: 'var(--text-muted)' }}>NODOS IOT — ESTADO EN TIEMPO REAL</div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '0.8rem', color: 'var(--text-muted)' }}>FILTRAR:</span>
              {['ALL', 'ONLINE', 'WARNING', 'OFFLINE'].map(f => (
                <button key={f} className={`filter-btn${filtro === f ? ' active' : ''}`} onClick={() => setFiltro(f)}>
                  {f === 'ALL' ? 'TODOS' : f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>NODO ID</th><th>SECTOR</th><th>pH</th>
                  <th>TURBIDEZ</th><th>BATERÍA</th><th>ÚLTIMO PING</th><th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Sin nodos para este filtro</td></tr>
                ) : filtrados.map(n => {
                  const bat = n.battery_percent ?? 0
                  const batColor  = bat < 15 ? 'var(--critical)' : bat < 30 ? 'var(--warning)' : 'var(--safe)'
                  const phColor   = n.ph == null ? 'var(--text-muted)' : (n.ph < 6.5 || n.ph > 8.5) ? 'var(--critical)' : 'var(--safe)'
                  const turbColor = n.turbidity == null ? 'var(--text-muted)' : n.turbidity > 5 ? 'var(--critical)' : n.turbidity > 3.5 ? 'var(--warning)' : 'var(--safe)'
                  return (
                    <tr key={n.id}>
                      <td style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.75rem', color: 'var(--cyan)', letterSpacing: '1px' }}>{n.id}</td>
                      <td style={{ fontFamily: "'Rajdhani',sans-serif", color: 'var(--text)' }}>{n.sector_id}</td>
                      <td style={{ fontFamily: "'JetBrains Mono',monospace", color: phColor }}>{formatPh(n.ph)}</td>
                      <td style={{ fontFamily: "'JetBrains Mono',monospace", color: turbColor }}>{n.turbidity != null ? n.turbidity.toFixed(2) + ' NTU' : '—'}</td>
                      <td>
                        <span style={{ display: 'inline-block', width: '60px', height: '8px', background: '#0d2040', verticalAlign: 'middle', borderRadius: '2px', overflow: 'hidden', marginRight: '0.4rem' }}>
                          <span style={{ display: 'block', height: '100%', width: `${bat}%`, background: batColor, borderRadius: '2px' }} />
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', color: batColor }}>{bat}%</span>
                        {bat < 15 && <span className="badge-low-bat" style={{ marginLeft: '0.3rem' }}>LOW-BAT</span>}
                      </td>
                      <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(n.last_ping)}</td>
                      <td><Badge status={n.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.6rem', letterSpacing: '3px', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>NORMA NCH 409 — UMBRALES DE CALIDAD DE AGUA POTABLE</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem' }}>
            <thead>
              <tr>
                {['Parámetro', 'Estado SAFE', 'Estado WARNING', 'Estado CONTAMINATED', 'Acción'].map(h => (
                  <th key={h} style={{ color: 'var(--text-muted)', fontWeight: 400, letterSpacing: '1px', textTransform: 'uppercase', padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['pH', '6.5 – 8.5', '—', '< 6.5 ó > 8.5', 'Alerta CRÍTICA + SMS mock'],
                ['Turbidez', '≤ 3.5 NTU', '3.5 – 5.0 NTU', '> 5.0 NTU', 'WARNING / Alerta CRÍTICA'],
                ['Batería', '≥ 30%', '15 – 29%', '< 15%', 'Badge LOW-BAT'],
                ['Ping', 'Último < 30 min', '30 – 60 min', '> 60 min / sin señal', 'Estado OFFLINE'],
              ].map(([param, safe, warn, cont, accion]) => (
                <tr key={param}>
                  <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid #071525', color: 'var(--cyan)' }}>{param}</td>
                  <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid #071525', color: 'var(--safe)' }}>{safe}</td>
                  <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid #071525', color: 'var(--warning)' }}>{warn}</td>
                  <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid #071525', color: 'var(--critical)' }}>{cont}</td>
                  <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid #071525', color: 'var(--text-muted)' }}>{accion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <footer className="footer">SIMCA v5.0 · SEREMI Región de Valparaíso · 2026</footer>
    </>
  )
}
