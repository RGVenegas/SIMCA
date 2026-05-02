import logging
from domain.ports.i_notification_port import INotificationPort

logger = logging.getLogger("simca.sms")

class MockSmsService(INotificationPort):
    def send_alert(self, sector_id: str, message: str) -> int:
        logger.info(f"[SMS MOCK] Sector {sector_id}: {message}")
        print(f"[SMS MOCK] Sector {sector_id}: {message}")
        return 1
