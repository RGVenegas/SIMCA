import { badgeClass, statusLabel } from '../utils/api'

export default function Badge({ status }) {
  return <span className={badgeClass(status)}>{statusLabel[status] || status}</span>
}
