import { useNavigate } from 'react-router-dom'

export default function Index() {
  const navigate = useNavigate()

  return (
    <div className="index-hero">
      <div>
        <div className="index-logo">
          <span className="drop">💧</span>
          <h1>SIMCA</h1>
        </div>
        <div className="index-subtitle">
          SISTEMA DE MONITOREO Y ALERTA DE CALIDAD DE AGUA<br />
          <span>Viña del Mar</span> · <span>Región de Valparaíso</span>
        </div>
      </div>

      <div className="role-cards">
        <div className="role-card" onClick={() => navigate('/habitante/estado')}>
          <span className="role-icon">🏠</span>
          <h2>HABITANTE</h2>
          <p>Consulta el estado del agua en tu sector y recibe alertas cuando haya riesgo.</p>
        </div>
        <div className="role-card" onClick={() => navigate('/autoridad/dashboard')}>
          <span className="role-icon">🏛</span>
          <h2>AUTORIDAD SANITARIA</h2>
          <p>Monitorea sensores, gestiona alertas y genera reportes para la comunidad.</p>
        </div>
      </div>

      <div className="index-footer">SIMCA v5.0 &nbsp;·&nbsp; 2026 &nbsp;·&nbsp; SEREMI Región de Valparaíso</div>
    </div>
  )
}
