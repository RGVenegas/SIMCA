export const API_BASE = '/api'

export async function fetchJSON(path) {
  const res = await fetch(API_BASE + path)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export function badgeClass(status) {
  const map = {
    SAFE: 'badge-safe', WARNING: 'badge-warning',
    CONTAMINATED: 'badge-critical', OFFLINE: 'badge-offline',
    ONLINE: 'badge-safe', INFO: 'badge-info', CRITICAL: 'badge-critical'
  }
  return 'badge ' + (map[status?.toUpperCase()] || 'badge-info')
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })
}

export function formatPh(val) {
  return val != null ? val.toFixed(2) : '—'
}

export const SECTOR_COORDS = {
  'VN-CENTRO':     { lat: -33.0248, lng: -71.5518, name: 'Viña Centro' },
  'VN-MIRAFLORES': { lat: -33.0350, lng: -71.5300, name: 'Miraflores Alto' },
  'VN-FORESTAL':   { lat: -33.0150, lng: -71.5400, name: 'Sector Forestal' },
  'VN-RENACA':     { lat: -32.9900, lng: -71.5500, name: 'Reñaca' },
  'VN-RECREO':     { lat: -33.0450, lng: -71.5450, name: 'Recreo' },
}

export function markerColor(status) {
  const map = { SAFE: '#00ff88', WARNING: '#ffaa00', CONTAMINATED: '#ff3366', UNKNOWN: '#4a5568' }
  return map[status?.toUpperCase()] || '#4a5568'
}

export function createColoredMarker(color) {
  const L = window.L
  return L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 8px ${color};"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}
