import { badgeClass } from '../utils/api'

export default function Badge({ status }) {
  return <span className={badgeClass(status)}>{status}</span>
}
