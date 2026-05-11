import { Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import Dashboard from './pages/autoridad/Dashboard'
import Sensores from './pages/autoridad/Sensores'
import Alertas from './pages/autoridad/Alertas'
import Reportes from './pages/autoridad/Reportes'
import Estado from './pages/habitante/Estado'
import Historial from './pages/habitante/Historial'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/autoridad/dashboard" element={<Dashboard />} />
      <Route path="/autoridad/sensores"  element={<Sensores />} />
      <Route path="/autoridad/alertas"   element={<Alertas />} />
      <Route path="/autoridad/reportes"  element={<Reportes />} />
      <Route path="/habitante/estado"    element={<Estado />} />
      <Route path="/habitante/historial" element={<Historial />} />
    </Routes>
  )
}
