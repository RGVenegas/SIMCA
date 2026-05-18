import logging
from domain.ports.i_notification_port import INotificationPort

logger = logging.getLogger("simca.sms")

class MockSmsService(INotificationPort):
    def send_alert(self, sector_id: str, message: str, phone_numbers: str = "") -> int:
        logger.info(f"[SMS MOCK] Sector {sector_id}: {message}")
        print(f"[SMS MOCK] Sector {sector_id}: {message}")
        if not phone_numbers:
            return 1
        return len([p for p in phone_numbers.split(",") if p.strip()])
