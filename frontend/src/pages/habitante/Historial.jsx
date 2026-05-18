import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Badge from '../../components/Badge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { fetchJSON, formatDate } from '../../utils/api'

export default function Historial() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sector, setSector] = useState(searchParams.get('sector') || 'VN-CENTRO')
  const [sectores, setSectores] = useState([])
  const [alertas, setAlertas] = useState(null)

  async function cargar(s) {
    try {
      const d = await fetchJSON(`/habitante/historial?sector=${s}`)
      setAlertas(d)
    } catch (e) { console.error(e) }
  }

  function cambiarSector(s) {
    setSector(s)
    setSearchParams({ sector: s })
  }

  useEffect(() => {
    fetchJSON('/sectores').then(setSectores).catch(() => {})
    cargar(sector)
  }, [sector])

  return (
    <>
      <Navbar rol="habitante" />
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="metric-label" style={{ fontSize: '0.65rem', letterSpacing: '3px' }}>HISTORIAL DE ALERTAS — VIÑA DEL MAR</div>
          <div className="sector-tabs">
            {sectores.map(s => (
              <button key={s.id} className={`sector-btn${s.id === sector ? ' active' : ''}`} onClick={() => cambiarSector(s.id)}>
                {s.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th><th>Tipo</th><th>Nivel</th>
                  <th>Mensaje</th><th>Valor</th><th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {!alertas ? (
                  <tr><td colSpan={6}><LoadingSpinner /></td></tr>
                ) : alertas.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#2a4060', padding: '2rem' }}>Sin alertas registradas para este sector</td></tr>
                ) : alertas.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem' }}>{formatDate(a.created_at)}</td>
                    <td>{a.type}</td>
                    <td><Badge status={a.level} /></td>
                    <td style={{ maxWidth: '300px' }}>{a.message}</td>
                    <td><span className={a.level === 'CRITICAL' ? 'tag-critical' : a.level === 'WARNING' ? 'tag-warning' : 'tag-safe'}>{typeof a.trigger_value === 'number' ? a.trigger_value.toFixed(2) : '—'}</span></td>
                    <td><span className={a.is_active ? 'badge badge-critical' : 'badge badge-safe'}>{a.is_active ? 'ACTIVA' : 'RESUELTA'}</span></td>
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
