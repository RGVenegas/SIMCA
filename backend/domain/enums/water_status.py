from enum import Enum

class WaterStatus(str, Enum):
    Safe = "SAFE"
    Warning = "WARNING"
    Contaminated = "CONTAMINATED"
    Unknown = "UNKNOWN"
