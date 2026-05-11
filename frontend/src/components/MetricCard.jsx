export default function MetricCard({ label, value, cls = 'card' }) {
  return (
    <div className={cls} style={{ textAlign: 'center', padding: '1.25rem 1rem' }}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
    </div>
  )
}
