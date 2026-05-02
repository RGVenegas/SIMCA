from abc import ABC, abstractmethod

class INotificationPort(ABC):
    @abstractmethod
    def send_alert(self, sector_id: str, message: str) -> int:
        """Envía alerta al sector. Retorna número de mensajes enviados."""
        ...
