# backend/tests/unit/test_water_quality_service.py
from unittest.mock import MagicMock
from application.services.water_quality_service import WaterQualityService
from domain.entities.sensor_reading import SensorReading
from domain.enums.water_status import WaterStatus

def test_safe():
    assert WaterQualityService.determine_status(7.0, 1.0) == WaterStatus.Safe

def test_warning_turbidity():
    assert WaterQualityService.determine_status(7.0, 4.0) == WaterStatus.Warning

def test_contaminated_ph_low():
    assert WaterQualityService.determine_status(6.0, 1.0) == WaterStatus.Contaminated

def test_contaminated_ph_high():
    assert WaterQualityService.determine_status(9.0, 1.0) == WaterStatus.Contaminated

def test_contaminated_turbidity():
    assert WaterQualityService.determine_status(7.0, 6.0) == WaterStatus.Contaminated

def test_boundary_ph_min_safe():
    assert WaterQualityService.determine_status(6.5, 1.0) == WaterStatus.Safe

def test_boundary_ph_max_safe():
    assert WaterQualityService.determine_status(8.5, 1.0) == WaterStatus.Safe

def test_invalid_ph_ignored():
    repo = MagicMock()
    notifier = MagicMock()
    service = WaterQualityService(notifier=notifier, sensor_repo=repo, alert_repo=repo)
    reading = SensorReading(node_id="X", sector_id="Y", ph=-1.0, turbidity=1.0)
    service.evaluate_reading(reading)
    repo.save.assert_not_called()

def test_contaminated_reading_creates_alert():
    repo = MagicMock()
    notifier = MagicMock()
    notifier.send_alert.return_value = 1
    service = WaterQualityService(notifier=notifier, sensor_repo=repo, alert_repo=repo)
    reading = SensorReading(node_id="VN-01", sector_id="VN-CENTRO", ph=9.5, turbidity=1.0)
    service.evaluate_reading(reading)
    repo.save_alert.assert_called_once()
    saved_alert = repo.save_alert.call_args[0][0]
    from domain.enums.alert_level import AlertLevel
    assert saved_alert.level == AlertLevel.Critical

def test_safe_reading_no_alert():
    repo = MagicMock()
    notifier = MagicMock()
    service = WaterQualityService(notifier=notifier, sensor_repo=repo, alert_repo=repo)
    reading = SensorReading(node_id="VN-01", sector_id="VN-CENTRO", ph=7.2, turbidity=1.0)
    service.evaluate_reading(reading)
    repo.save_alert.assert_not_called()
