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
import { fetchJSON, formatDate, SECTOR_COORDS, markerColor } from '../../utils/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const CHART_OPTS = {
  responsive: true,
  plugins: { legend: { labels: { color: '#c8d8e8', font: { family: 'Rajdhani', size: 12 } } } },
  scales: {
    x: { ticks: { color: '#5a7a9a', font: { family: 'JetBrains Mono', size: 10 }, maxTicksLimit: 8 }, grid: { color: '#0d2040' } },
    y: { ticks: { color: '#5a7a9a', font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: '#0d2040' } },
  },
}

export default function Dashboard() {
  const [data, setData]         = useState(null)
  const [graficos, setGraficos] = useState(null)
  const [sectorSel, setSectorSel] = useState('')
  const [sectores, setSectores] = useState([])

  async function cargar() {
    const d = await fetchJSON('/autoridad/dashboard')
    setData(d)
  }

  async function cargarGraficos(sector) {
    if (!sector) return
    const g = await fetchJSON(`/graficos/${sector}`)
    setGraficos(g)
  }

  useEffect(() => {
    fetchJSON('/sectores').then(s => {
      setSectores(s)
      if (s.length) { setSectorSel(s[0].id); cargarGraficos(s[0].id) }
    })
    cargar()
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

  const { nodes = [], active_alerts: activeAlerts = [], all_alerts: allAlerts = [] } = data
  const online = nodes.filter(n => n.status !== 'OFFLINE').length

  const lastSms = allAlerts.find(a => a.sms_sent)
  const smsText = lastSms
    ? `[SIMCA ALERT] ${lastSms.sector_id}: ${lastSms.message} Contacte SEREMI: 800-SIMCA-VNA`
    : null

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

        {/* Métricas */}
        <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
          <MetricCard label="PH PROMEDIO"    value={data.ph_promedio?.toFixed(2) ?? '—'}                      cls="card-cyan" />
          <MetricCard label="TURBIDEZ MÁXIMA" value={`${data.turbidez_maxima?.toFixed(2) ?? '—'} NTU`}        cls="card" />
          <MetricCard label="NODOS ACTIVOS"  value={`${online}/${nodes.length}`}                               cls={online > 0 ? 'card-cyan' : 'card'} />
          <MetricCard label="ALERTAS HOY"    value={data.alertas_hoy ?? 0}                                     cls={data.alertas_hoy > 0 ? 'card-alert' : 'card'} />
        </div>

        {/* Gráficos + Alertas recientes + SMS */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

          {/* Columna izquierda: gráficos */}
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
            {graficos && <Line data={phData} options={CHART_OPTS} />}
            {graficos && <div style={{ marginTop: '1rem' }}><Line data={turbData} options={CHART_OPTS} /></div>}
          </div>

          {/* Columna derecha: alertas + SMS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.65rem', letterSpacing: '3px', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>ALERTAS RECIENTES</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '280px', overflowY: 'auto' }}>
                {allAlerts.slice(0, 6).map(a => (
                  <div key={a.id} style={{ borderLeft: `3px solid ${a.level === 'CRITICAL' ? 'var(--critical)' : 'var(--warning)'}`, paddingLeft: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.65rem', color: 'var(--cyan)', letterSpacing: '1px' }}>
                          {a.node_id} · <span style={{ color: 'var(--text-muted)' }}>{a.sector_id}</span>
                        </div>
                        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: '0.85rem', color: 'var(--text)', marginTop: '0.15rem' }}>{a.message}</div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{formatDate(a.created_at)}</div>
                      </div>
                      <span className={a.level === 'CRITICAL' ? 'badge badge-critical' : 'badge badge-warning'} style={{ flexShrink: 0 }}>{a.level}</span>
                    </div>
                  </div>
                ))}
                {allAlerts.length === 0 && (
                  <div style={{ color: 'var(--safe)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                    ✓ Sin alertas activas
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.65rem', letterSpacing: '3px', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>ÚLTIMO SMS ENVIADO [MOCK]</div>
              {smsText ? (
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', color: '#00d4aa', lineHeight: 1.7, background: '#06101a', padding: '0.75rem', border: '1px solid #1a3a5c' }}>
                  {smsText}
                </div>
              ) : (
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.75rem' }}>Sin SMS enviados aún</div>
              )}
            </div>
          </div>
        </div>

        {/* Mapa full-width */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.65rem', letterSpacing: '3px', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>MAPA DE SECTORES — VIÑA DEL MAR</div>
          <MapContainer center={[-33.024, -71.551]} zoom={12} style={{ height: '260px', border: '1px solid var(--border)' }} zoomControl={true}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OSM &copy; CARTO' maxZoom={19} />
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
      <footer className="footer">SIMCA v5.0 · SEREMI Región de Valparaíso · 2026</footer>
    </>
  )
}
