import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import Navbar from '../../components/Navbar'
import MetricCard from '../../components/MetricCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { fetchJSON, formatDate, formatPh, SECTOR_COORDS, markerColor } from '../../utils/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const CHART_OPTS = () => ({
  responsive: true,
  plugins: { legend: { labels: { color: '#c8d8e8', font: { family: 'Rajdhani', size: 12 } } } },
  scales: {
    x: { ticks: { color: '#5a7a9a', font: { family: 'JetBrains Mono', size: 10 }, maxTicksLimit: 8 }, grid: { color: '#0d2040' } },
    y: { ticks: { color: '#5a7a9a', font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: '#0d2040' } },
  },
})

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [graficos, setGraficos] = useState(null)
  const [sectorSel, setSectorSel] = useState('')
  const [sectores, setSectores] = useState([])

  async function cargar() {
    const d = await fetchJSON('/autoridad/dashboard')
    setData(d)
    if (!sectorSel && d.nodes?.length) {
      const primeroSector = d.nodes[0].sector_id
      setSectorSel(primeroSector)
    }
  }

  async function cargarSectores() {
    const s = await fetchJSON('/sectores')
    setSectores(s)
    if (!sectorSel && s.length) setSectorSel(s[0].id)
  }

  async function cargarGraficos(sector) {
    if (!sector) return
    const g = await fetchJSON(`/graficos/${sector}`)
    setGraficos(g)
  }

  useEffect(() => {
    cargar()
    cargarSectores()
    const id = setInterval(cargar, 15000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (sectorSel) cargarGraficos(sectorSel)
  }, [sectorSel])

  if (!data) return (
    <>
      <Navbar rol="autoridad" />
      <div className="container"><LoadingSpinner /></div>
      <footer className="footer">SIMCA v5.0 · SEREMI Región de Valparaíso · 2026</footer>
    </>
  )

  // Fix: la API retorna all_alerts y active_alerts, no alerts
  const { nodes = [], active_alerts: activeAlerts = [], all_alerts: allAlerts = [] } = data
  const activas  = activeAlerts.length
  const criticas = activeAlerts.filter(a => a.level === 'CRITICAL').length
  const online   = nodes.filter(n => n.status !== 'OFFLINE').length
  const offline  = nodes.filter(n => n.status === 'OFFLINE').length

  const phData = graficos ? {
    labels: graficos.labels,
    datasets: [{ label: 'pH', data: graficos.ph, borderColor: '#00d4aa', backgroundColor: '#00d4aa22', tension: 0.4, fill: true, pointRadius: 2 }]
  } : { labels: [], datasets: [] }

  const turbData = graficos ? {
    labels: graficos.labels,
    datasets: [{ label: 'Turbidez NTU', data: graficos.turbidity, borderColor: '#ff6b00', backgroundColor: '#ff6b0022', tension: 0.4, fill: true, pointRadius: 2 }]
  } : { labels: [], datasets: [] }

  const center = [-33.024, -71.551]

  return (
    <>
      <Navbar rol="autoridad" />
      <div className="container">
        <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
          <MetricCard label="NODOS ACTIVOS"    value={online}   cls={online > 0 ? 'card-cyan' : 'card'} />
          <MetricCard label="NODOS OFFLINE"    value={offline}  cls={offline > 0 ? 'card-alert' : 'card'} />
          <MetricCard label="ALERTAS ACTIVAS"  value={activas}  cls={activas > 0 ? 'card-alert' : 'card'} />
          <MetricCard label="ALERTAS CRÍTICAS" value={criticas} cls={criticas > 0 ? 'card-alert' : 'card'} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-muted)' }}>TENDENCIA pH / TURBIDEZ</span>
              <select
                style={{ background: '#06101a', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: "'Rajdhani',sans-serif", fontSize: '0.85rem', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
                value={sectorSel}
                onChange={e => setSectorSel(e.target.value)}
              >
                {sectores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {graficos && <Line data={phData} options={CHART_OPTS()} />}
            {graficos && <Line data={turbData} options={CHART_OPTS()} style={{ marginTop: '1rem' }} />}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.65rem', letterSpacing: '3px', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>ALERTAS RECIENTES</div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeAlerts.slice(0, 5).map(a => (
                  <div key={a.id} className={`alert-item${a.level === 'WARNING' ? ' warning' : ''}`}>
                    <div className="alert-info">
                      <div className="alert-node">{a.node_id}</div>
                      <div className="alert-msg">{a.message}</div>
                    </div>
                    <div className="alert-time">{formatDate(a.created_at)}</div>
                  </div>
                ))}
                {activeAlerts.length === 0 && (
                  <div style={{ color: 'var(--safe)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                    ✓ Sin alertas activas
                  </div>
                )}
              </div>
            </div>

            <div className="card" style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.65rem', letterSpacing: '3px', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>MAPA DE SECTORES</div>
              <MapContainer center={center} zoom={12} style={{ height: '220px', border: '1px solid var(--border)' }} zoomControl={true}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; OSM &copy; CARTO'
                  maxZoom={19}
                />
                {sectores.map(s => {
                  const coords = SECTOR_COORDS[s.id]
                  if (!coords) return null
                  const sectorAlertas = activeAlerts.filter(a => a.sector_id === s.id)
                  const status = sectorAlertas.length === 0 ? 'SAFE' : sectorAlertas.some(a => a.level === 'CRITICAL') ? 'CONTAMINATED' : 'WARNING'
                  return (
                    <CircleMarker key={s.id} center={[coords.lat, coords.lng]} radius={10} pathOptions={{ color: markerColor(status), fillColor: markerColor(status), fillOpacity: 0.8 }}>
                      <Popup><b style={{ color: markerColor(status) }}>{coords.name}</b><br />{status}</Popup>
                    </CircleMarker>
                  )
                })}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer">SIMCA v5.0 · SEREMI Región de Valparaíso · 2026</footer>
    </>
  )
}
