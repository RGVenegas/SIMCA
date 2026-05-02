from abc import ABC, abstractmethod
from typing import List, Optional
from domain.entities.iot_node import IoTNode
from domain.entities.sector import Sector
from domain.entities.sensor_reading import SensorReading

class ISensorRepository(ABC):
    @abstractmethod
    def save(self, reading: SensorReading) -> None: ...

    @abstractmethod
    def get_by_sector(self, sector_id: str, hours: int = 24) -> List[SensorReading]: ...

    @abstractmethod
    def get_all_nodes(self) -> List[IoTNode]: ...

    @abstractmethod
    def get_node(self, node_id: str) -> Optional[IoTNode]: ...

    @abstractmethod
    def update_node(self, node: IoTNode) -> None: ...

    @abstractmethod
    def get_all_sectors(self) -> List[Sector]: ...

    @abstractmethod
    def get_sector(self, sector_id: str) -> Optional[Sector]: ...
