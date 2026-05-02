from enum import Enum

class AlertLevel(str, Enum):
    Info = "INFO"
    Warning = "WARNING"
    Critical = "CRITICAL"
