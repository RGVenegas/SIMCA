import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import Navbar from '../../components/Navbar'
import MetricCard from '../../components/MetricCard'
import Badge from '../../components/Badge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { fetchJSON, formatDate } from '../../utils/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const CHART_OPTS = {
  responsive: true,
  plugins: { legend: { labels: { color: '#c8d8e8', font: { family: 'Rajdhani', size: 12 } } } },
  scales: {
    x: { ticks: { color: '#5a7a9a', font: { family: 'JetBrains Mono', size: 10 }, maxTicksLimit: 8 }, grid: { color: '#0d2040' } },
    y: { ticks: { color: '#5a7a9a', font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: '#0d2040' } },
  },
}

export default function Reportes() {
  const [sectores, setSectores] = useState([])
  const [alertas, setAlertas] = useState(null)
  const [nodes, setNodes] = useState([])
  const [graficos, setGraficos] = useState(null)
  const [sectorSel, setSectorSel] = useState('')

  async function cargarGraficos(sector) {
    if (!sector) return
    const g = await fetchJSON(`/graficos/${sector}`)
    setGraficos(g)
  }

  useEffect(() => {
    async function init() {
      const [secs, alertasData, dash] = await Promise.all([
        fetchJSON('/sectores'),
        fetchJSON('/autoridad/reportes'),
        fetchJSON('/autoridad/dashboard'),
      ])
      setSectores(secs)
      setAlertas(alertasData)
      setNodes(dash.nodes ?? [])
      if (secs.length) {
        setSectorSel(secs[0].id)
        cargarGraficos(secs[0].id)
      }
    }
    init()
    const id = setInterval(() => {
      fetchJSON('/autoridad/reportes').then(setAlertas)
      fetchJSON('/autoridad/dashboard').then(d => setNodes(d.nodes ?? []))
    }, 15000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (sectorSel) cargarGraficos(sectorSel)
  }, [sectorSel])

  function exportCSV() {
    const rows = [['fecha', 'nodo', 'sector', 'tipo', 'nivel', 'mensaje', 'resuelto']]
    alertas.forEach(a => rows.push([a.created_at, a.node_id, a.sector_id, a.type, a.level, a.message, a.resolved_at ?? 'pendiente']))
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `simca_reporte_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  if (!alertas) return (
    <>
      <Navbar rol="autoridad" />
      <div className="container"><LoadingSpinner /></div>
    </>
  )

  const criticas  = alertas.filter(a => a.level === 'CRITICAL').length
  const resueltas = alertas.filter(a => !a.is_active).length

  const phData = graficos ? {
    labels: graficos.labels,
    datasets: [{ label: 'pH', data: graficos.ph, borderColor: '#00d4aa', backgroundColor: '#00d4aa22', tension: 0.4, fill: true, pointRadius: 2 }]
  } : { labels: [], datasets: [] }

  const turbData = graficos ? {
    labels: graficos.labels,
    datasets: [{ label: 'Turbidez NTU', data: graficos.turbidity, borderColor: '#ff6b00', backgroundColor: '#ff6b0022', tension: 0.4, fill: true, pointRadius: 2 }]
  } : { labels: [], datasets: [] }

  return (
    <>
      <Navbar rol="autoridad" />
      <div className="container">
        <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
          <MetricCard label="SECTORES"         value={sectores.length} cls="card-cyan" />
          <MetricCard label="NODOS TOTALES"    value={nodes.length}    cls="card" />
          <MetricCard label="CRÍTICAS HISTÓRICAS" value={criticas}        cls={criticas > 0 ? 'card-alert' : 'card'} />
          <MetricCard label="RESUELTAS"        value={resueltas}       cls="card" />
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.65rem', letterSpacing: '3px', color: 'var(--text-muted)' }}>EVOLUCIÓN HISTÓRICA — LECTURAS IOT</div>
            <select
              style={{ background: '#06101a', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: "'Rajdhani',sans-serif", fontSize: '0.9rem', padding: '0.4rem 0.75rem', cursor: 'pointer', minWidth: '180px' }}
              value={sectorSel}
              onChange={e => setSectorSel(e.target.value)}
            >
              {sectores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '1px' }}>EVOLUCIÓN DE pH</div>
              <Line data={phData} options={CHART_OPTS} />
            </div>
            <div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '1px' }}>EVOLUCIÓN DE TURBIDEZ (NTU)</div>
              <Line data={turbData} options={CHART_OPTS} />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.65rem', letterSpacing: '3px', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>COBERTURA POR SECTOR</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem' }}>
            <thead>
              <tr>
                {['Sector', 'Nombre', 'Activos', 'Cobertura', 'Alertas totales', 'Estado general'].map(h => (
                  <th key={h} style={{ color: 'var(--text-muted)', fontWeight: 400, letterSpacing: '1px', textTransform: 'uppercase', padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sectores.map(s => {
                const sNodes    = nodes.filter(n => n.sector_id === s.id)
                const nodeCount = sNodes.length
                const active    = sNodes.filter(n => n.status !== 'OFFLINE').length
                const coverage  = nodeCount > 0 ? Math.round((active / nodeCount) * 100) : 0
                const sAlertas  = alertas.filter(a => a.sector_id === s.id).length
                const actAlertas = alertas.filter(a => a.sector_id === s.id && a.is_active)
                const status = actAlertas.length === 0 ? (nodeCount > 0 ? 'SAFE' : '—') : actAlertas.some(a => a.level === 'CRITICAL') ? 'CONTAMINATED' : 'WARNING'
                const statusColor = status === 'SAFE' ? 'var(--safe)' : status === 'WARNING' ? 'var(--warning)' : status === 'CONTAMINATED' ? 'var(--critical)' : 'var(--text-muted)'
                return (
                  <tr key={s.id}>
                    <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid #071525', color: 'var(--cyan)', fontFamily: "'Orbitron',monospace", fontSize: '0.7rem', letterSpacing: '1px' }}>{s.id}</td>
                    <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid #071525', color: 'var(--text)', fontFamily: "'Rajdhani',sans-serif" }}>{s.name}</td>
                    <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid #071525', color: 'var(--text)' }}>{active}/{nodeCount}</td>
                    <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid #071525' }}>
                      <span style={{ display: 'inline-block', width: '80px', height: '6px', background: '#0d2040', verticalAlign: 'middle', borderRadius: '2px', overflow: 'hidden', marginRight: '0.5rem' }}>
                        <span style={{ display: 'block', height: '100%', width: `${coverage}%`, background: 'var(--cyan)', borderRadius: '2px' }} />
                      </span>
                      <span style={{ color: 'var(--cyan)', fontSize: '0.7rem' }}>{coverage}%</span>
                    </td>
                    <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid #071525', color: sAlertas > 0 ? 'var(--warning)' : 'var(--text-muted)' }}>{sAlertas}</td>
                    <td style={{ padding: '0.55rem 0.75rem', borderBottom: '1px solid #071525', color: statusColor, fontFamily: "'Rajdhani',sans-serif", fontWeight: 600 }}>{status}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.65rem', letterSpacing: '3px', color: 'var(--text-muted)' }}>HISTORIAL COMPLETO DE ALERTAS</div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-outline btn-sm" onClick={exportCSV}>EXPORTAR CSV</button>
              <button className="btn btn-outline btn-sm" onClick={() => window.print()}>IMPRIMIR</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr><th>FECHA</th><th>NODO</th><th>SECTOR</th><th>TIPO</th><th>NIVEL</th><th>MENSAJE</th><th>RESUELTO</th></tr>
              </thead>
              <tbody>
                {alertas.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Sin alertas registradas</td></tr>
                ) : alertas.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(a.created_at)}</td>
                    <td style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.7rem', color: 'var(--cyan)' }}>{a.node_id}</td>
                    <td style={{ fontFamily: "'Rajdhani',sans-serif", color: 'var(--text)' }}>{a.sector_id}</td>
                    <td style={{ fontFamily: "'Rajdhani',sans-serif", color: 'var(--text)' }}>{a.type}</td>
                    <td><Badge status={a.level} /></td>
                    <td style={{ fontFamily: "'Rajdhani',sans-serif", color: 'var(--text-muted)' }}>{a.message}</td>
                    <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {a.resolved_at ? formatDate(a.resolved_at) : <span style={{ color: 'var(--critical)' }}>PENDIENTE</span>}
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
