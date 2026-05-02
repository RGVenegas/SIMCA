from enum import Enum

class NodeStatus(str, Enum):
    Online = "ONLINE"
    Warning = "WARNING"
    Offline = "OFFLINE"
