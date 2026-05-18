import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import Navbar from '../../components/Navbar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { fetchJSON, formatDate, SECTOR_COORDS } from '../../utils/api'

function getSemaforoClass(status) {
  if (status === 'SAFE') return 'dot-safe'
  if (status === 'WARNING') return 'dot-warning'
  if (status === 'CONTAMINATED') return 'dot-critical'
  return 'dot-unknown'
}
function getSemaforoIcon(status) {
  if (status === 'SAFE') return '✓'
  if (status === 'WARNING') return '!'
  if (status === 'CONTAMINATED') return 'X'
  return '?'
}
function getSemaforoLabel(status) {
  if (status === 'SAFE') return 'POTABLE'
  if (status === 'WARNING') return 'ADVERTENCIA'
  if (status === 'CONTAMINATED') return 'NO POTABLE'
  return 'SIN DATOS'
}
function getSemaforoDesc(status) {
  if (status === 'SAFE') return 'El agua de tu sector cumple los estándares de calidad.'
  if (status === 'WARNING') return 'Turbidez elevada. Usa el agua con precaución.'
  if (status === 'CONTAMINATED') return 'Tu sector tiene una alerta activa. Evita consumir el agua hasta nuevo aviso de la Autoridad Sanitaria.'
  return ''
}
function getPhClass(status) {
  if (status === 'SAFE') return 'ph-value safe'
  if (status === 'WARNING') return 'ph-value warning'
  if (status === 'CONTAMINATED') return 'ph-value critical'
  return 'ph-value'
}

export default function Estado() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sector, setSector] = useState(searchParams.get('sector') || 'VN-CENTRO')
  const [sectores, setSectores] = useState([])
  const [data, setData] = useState(null)
  const [smsInput, setSmsInput] = useState('')
  const [smsRespuesta, setSmsRespuesta] = useState('')

  async function cargar(s) {
    try {
      const d = await fetchJSON(`/habitante/estado?sector=${s}`)
      setData(d)
    } catch (e) { console.error(e) }
  }

  function cambiarSector(s) {
    setSector(s)
    setSearchParams({ sector: s })
  }

  async function enviarSMS() {
    const input = smsInput.trim().toUpperCase()
    let target = sector
    if (input.includes('MIRAFLORES')) target = 'VN-MIRAFLORES'
    else if (input.includes('FORESTAL')) target = 'VN-FORESTAL'
    else if (input.includes('REÑACA') || input.includes('RENACA')) target = 'VN-RENACA'
    else if (input.includes('RECREO')) target = 'VN-RECREO'
    else if (input.includes('CENTRO') || input.includes('VIÑA')) target = 'VN-CENTRO'
    try {
      const d = await fetchJSON(`/habitante/estado?sector=${target}`)
      const statusText = d.water_status === 'SAFE' ? 'POTABLE' : d.water_status === 'WARNING' ? 'ADVERTENCIA' : 'NO POTABLE'
      setSmsRespuesta(`DE: SIMCA <+56 9 XXXX XXXX>\n\nESTADO ${d.sector_name?.toUpperCase()}\n\npH: ${d.ph?.toFixed(1) ?? '—'} | Turbidez: ${d.turbidity?.toFixed(1) ?? '—'} NTU\nEstado: ${statusText}\n\nInfo: 800-555-SIMCA\nSIMCA · SEREMI Valparaíso`)
    } catch (e) {
      setSmsRespuesta('Error al consultar el servicio.')
    }
  }

  useEffect(() => {
    fetchJSON('/sectores').then(setSectores).catch(() => {})
    cargar(sector)
    const id = setInterval(() => cargar(sector), 15000)
    return () => clearInterval(id)
  }, [sector])

  const coords = SECTOR_COORDS[sector]
  const center = coords ? [coords.lat, coords.lng] : [-33.024, -71.551]

  const ESTADOS_CONOCIDOS = ['SAFE', 'WARNING', 'CONTAMINATED'];
  const estadoValido = ESTADOS_CONOCIDOS.includes(data?.water_status) ? data.water_status : 'UNKNOWN';

  const phMostrado = data?.has_active_alert && data?.active_alert?.type === 'PH'
    ? data.active_alert.trigger_value
    : data?.ph;
  const turbMostrada = data?.has_active_alert && data?.active_alert?.type === 'TURBIDITY'
    ? data.active_alert.trigger_value
    : data?.turbidity;

  return (
    <>
      <Navbar rol="habitante" />
      <div className="container">
        {data?.has_active_alert && data?.active_alert && (
          <div className="alert-banner" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>ALERTA — {data.sector_name}</strong><br />
                <span style={{ fontSize: '0.85rem', color: '#c8d8e8' }}>{data.active_alert.message}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(data.active_alert.created_at)}</span>
            </div>
          </div>
        )}

        <div className="estado-main">
          <div className="estado-left card">
            <div className="semaforo-wrapper">
              <div className={`semaforo-dot ${data ? getSemaforoClass(estadoValido) : 'dot-unknown'}`}>
                <div>{data ? getSemaforoIcon(estadoValido) : '?'}</div>
              </div>
              <div className="semaforo-label" style={{ color: estadoValido === 'SAFE' ? '#00d4aa' : estadoValido === 'WARNING' ? '#ffaa00' : estadoValido === 'CONTAMINATED' ? '#ff3030' : '#4a6080' }}>
                {data ? getSemaforoLabel(estadoValido) : 'CARGANDO...'}
              </div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", color: '#4a6080', fontSize: '0.85rem', marginTop: '0.3rem' }}>{data?.sector_name}</div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", color: '#7a8fab', fontSize: '0.85rem', textAlign: 'center', maxWidth: '220px', marginTop: '0.5rem', lineHeight: 1.5 }}>
                {data ? getSemaforoDesc(estadoValido) : ''}
              </div>
            </div>
          </div>

          <div className="estado-right">
            <div className="metric-row">
              <div className="metric-label" style={{ fontSize: '0.7rem', letterSpacing: '3px', marginBottom: '0.3rem' }}>pH/CONCENTRACIÓN</div>
              <div className={data ? getPhClass(estadoValido) : 'ph-value'}>
                {phMostrado != null ? phMostrado.toFixed(1) : '—'}
              </div>
              <div className="ph-range">Rango seguro: 6.5 - 8.5</div>
              {data?.has_active_alert && data?.active_alert?.type === 'PH' && data?.ph != null && (
                <div className="ph-range">Lectura más reciente: {data.ph.toFixed(1)}</div>
              )}
            </div>
            <div className="metric-row">
              <div className="metric-label" style={{ fontSize: '0.7rem', letterSpacing: '3px', marginBottom: '0.3rem' }}>TURBIDEZ</div>
              <div className={data ? getPhClass(estadoValido) : 'ph-value'}>
                {turbMostrada != null ? <>{turbMostrada.toFixed(1)} <span style={{ fontSize: '1.2rem' }}>NTU</span></> : '— NTU'}
              </div>
              <div className="ph-range">Límite: 5 NTU</div>
              {data?.has_active_alert && data?.active_alert?.type === 'TURBIDITY' && data?.turbidity != null && (
                <div className="ph-range">Lectura más reciente: {data.turbidity.toFixed(1)} NTU</div>
              )}
            </div>
            <div className="metric-row" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', color: '#4a6080' }}>
              ↳ Línea directa SEREMI Valparaíso:
              <span style={{ color: '#ff6b00', fontSize: '1rem', display: 'block', marginTop: '0.2rem' }}>800-555-SIMCA</span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div className="metric-label" style={{ marginBottom: '0.8rem', fontSize: '0.65rem', letterSpacing: '3px' }}>CAMBIAR SECTOR</div>
          <div className="sector-tabs">
            {sectores.map(s => (
              <button key={s.id} className={`sector-btn${s.id === sector ? ' active' : ''}`} onClick={() => cambiarSector(s.id)}>
                {s.name.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.65rem', letterSpacing: '3px', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>UBICACIÓN DEL SECTOR</div>
          <MapContainer center={center} zoom={14} style={{ height: '220px', border: '1px solid var(--border)' }} key={sector}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OSM &copy; CARTO' maxZoom={19} />
            {coords && (
              <CircleMarker center={[coords.lat, coords.lng]} radius={12} pathOptions={{ color: '#00d4aa', fillColor: '#00d4aa', fillOpacity: 0.8 }}>
                <Popup><b style={{ color: '#00d4aa' }}>{coords.name}</b><br />Sector monitoreado por SIMCA</Popup>
              </CircleMarker>
            )}
          </MapContainer>
        </div>

        <div className="sms-section">
          <div className="sms-title">CONSULTA EL ESTADO VÍA SMS</div>
          <div className="sms-subtitle">Simula el envío de un SMS para consultar el estado del agua de tu sector.</div>
          <div className="sms-input-row">
            <input
              className="sms-input"
              type="text"
              placeholder="Escribe: ESTADO VIÑA CENTRO o ESTADO MIRAFLORES"
              value={smsInput}
              onChange={e => setSmsInput(e.target.value)}
            />
            <button className="btn btn-solid" onClick={enviarSMS}>ENVIAR</button>
          </div>
          <div className="sms-example">Ej: ESTADO CENTRO o ESTADO MIRAFLORES</div>
          {smsRespuesta && (
            <div style={{ marginTop: '1rem', background: '#06101a', border: '1px solid #1a3a5c', padding: '1rem', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem', lineHeight: 1.8, color: '#c8d8e8', whiteSpace: 'pre-wrap' }}>
              {smsRespuesta}
            </div>
          )}
        </div>
      </div>
      <footer className="footer">SIMCA v5.0 · SEREMI Región de Valparaíso · 2026</footer>
    </>
  )
}
