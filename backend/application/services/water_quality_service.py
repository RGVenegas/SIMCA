from datetime import datetime
from domain.entities.alert import Alert
from domain.entities.sensor_reading import SensorReading
from domain.enums.alert_level import AlertLevel
from domain.enums.node_status import NodeStatus
from domain.enums.water_status import WaterStatus
from domain.ports.i_alert_repository import IAlertRepository
from domain.ports.i_notification_port import INotificationPort
from domain.ports.i_sensor_repository import ISensorRepository

PH_MIN = 6.5
PH_MAX = 8.5
TURBIDITY_MAX = 5.0
TURBIDITY_WARNING = 3.5

class WaterQualityService:
    def __init__(self, notifier: INotificationPort, sensor_repo: ISensorRepository, alert_repo: IAlertRepository):
        self._notifier = notifier
        self._sensor_repo = sensor_repo
        self._alert_repo = alert_repo

    def evaluate_reading(self, reading: SensorReading) -> None:
        if reading.ph < 0 or reading.ph > 14:
            return

        reading.status = self.determine_status(reading.ph, reading.turbidity)
        reading.recorded_at = datetime.now()
        self._sensor_repo.save(reading)

        node = self._sensor_repo.get_node(reading.node_id)
        if node:
            node.ph = reading.ph
            node.turbidity = reading.turbidity
            node.last_ping = datetime.now()
            node.status = NodeStatus.Online if reading.status == WaterStatus.Safe else NodeStatus.Warning
            self._sensor_repo.update_node(node)

        if reading.status == WaterStatus.Contaminated:
            self._handle_critical_alert(reading)
        elif reading.status == WaterStatus.Warning:
            self._handle_warning_alert(reading)

    @staticmethod
    def determine_status(ph: float, turbidity: float) -> WaterStatus:
        if ph < PH_MIN or ph > PH_MAX or turbidity > TURBIDITY_MAX:
            return WaterStatus.Contaminated
        if turbidity > TURBIDITY_WARNING:
            return WaterStatus.Warning
        return WaterStatus.Safe

    def _handle_critical_alert(self, reading: SensorReading) -> None:
        ph_issue = reading.ph < PH_MIN or reading.ph > PH_MAX
        if reading.ph < PH_MIN:
            msg = f"pH {reading.ph:.1f} bajo (mín 6.5). No consumas el agua."
        elif reading.ph > PH_MAX:
            msg = f"pH {reading.ph:.1f} alto (máx 8.5). No consumas el agua."
        else:
            msg = f"Turbidez {reading.turbidity:.1f} NTU crítica. No consumas el agua."

        sent = self._notifier.send_alert(reading.sector_id, msg)
        self._alert_repo.save_alert(Alert(
            node_id=reading.node_id,
            sector_id=reading.sector_id,
            level=AlertLevel.Critical,
            type="pH" if ph_issue else "Turbidez",
            message=msg,
            trigger_value=reading.ph if ph_issue else reading.turbidity,
            sms_sent=sent,
            is_active=True,
        ))

    def _handle_warning_alert(self, reading: SensorReading) -> None:
        msg = f"Turbidez elevada {reading.turbidity:.1f} NTU. Precaución."
        self._alert_repo.save_alert(Alert(
            node_id=reading.node_id,
            sector_id=reading.sector_id,
            level=AlertLevel.Warning,
            type="Turbidez",
            message=msg,
            trigger_value=reading.turbidity,
            sms_sent=0,
            is_active=True,
        ))
