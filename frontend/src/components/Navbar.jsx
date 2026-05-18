import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar({ rol }) {
  const [hora, setHora] = useState(new Date().toLocaleTimeString('es-CL'))
  const location = useLocation()

  useEffect(() => {
    const id = setInterval(() => setHora(new Date().toLocaleTimeString('es-CL')), 1000)
    return () => clearInterval(id)
  }, [])

  const esAutoridad = rol === 'autoridad'
  const tabs = esAutoridad ? [
    { path: '/autoridad/dashboard', label: 'DASHBOARD' },
    { path: '/autoridad/sensores',  label: 'SENSORES' },
    { path: '/autoridad/alertas',   label: 'ALERTAS' },
    { path: '/autoridad/reportes',  label: 'REPORTES' },
  ] : [
    { path: '/habitante/estado',    label: 'MI AGUA' },
    { path: '/habitante/historial', label: 'HISTORIAL' },
  ]

  const avatar   = esAutoridad ? 'A' : 'H'
  const usuario  = esAutoridad ? 'Autoridad Sanitaria' : 'Habitante'
  const rolBadge = esAutoridad ? 'ADMIN' : 'COMUNIDAD'

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link className="nav-logo" to="/">SIMCA</Link>
        <div className="nav-tabs">
          {tabs.map(t => (
            <Link
              key={t.path}
              to={t.path}
              className={`nav-tab${location.pathname === t.path ? ' active' : ''}`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="nav-status">
        <span className="nav-live"><span className="live-dot"></span> EN VIVO</span>
        <span className="nav-time">{hora}</span>
        <div className="nav-avatar">{avatar}</div>
        <span className="nav-user">{usuario}</span>
        <span className="nav-role-badge">{rolBadge}</span>
        <Link to="/" className="btn-salir">← Salir</Link>
      </div>
    </nav>
  )
}
