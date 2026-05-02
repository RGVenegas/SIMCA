from datetime import datetime, timedelta
from sqlmodel import Session, select
from domain.entities.iot_node import IoTNode
from domain.entities.sector import Sector
from domain.enums.node_status import NodeStatus

def seed_database(session: Session) -> None:
    existing = session.exec(select(Sector)).first()
    if existing:
        return

    sectors = [
        Sector(id="VN-CENTRO",     name="Viña Centro",      comuna="Viña del Mar", population=38200, phone_numbers="+56912340001,+56912340002"),
        Sector(id="VN-MIRAFLORES", name="Miraflores Alto",  comuna="Viña del Mar", population=22500, phone_numbers="+56912340003,+56912340004"),
        Sector(id="VN-FORESTAL",   name="Sector Forestal",  comuna="Viña del Mar", population=18700, phone_numbers="+56912340005"),
        Sector(id="VN-RENACA",     name="Reñaca",            comuna="Viña del Mar", population=14300, phone_numbers="+56912340006"),
        Sector(id="VN-RECREO",     name="Recreo",            comuna="Viña del Mar", population=19100, phone_numbers="+56912340007"),
    ]

    now = datetime.now()
    nodes = [
        IoTNode(id="VN-03", sector_id="VN-CENTRO",     ph=7.1,  turbidity=0.8, battery_percent=91, last_ping=now - timedelta(minutes=1), status=NodeStatus.Online),
        IoTNode(id="VN-01", sector_id="VN-CENTRO",     ph=7.2,  turbidity=1.1, battery_percent=85, last_ping=now - timedelta(minutes=2), status=NodeStatus.Online),
        IoTNode(id="MF-07", sector_id="VN-MIRAFLORES", ph=7.4,  turbidity=4.8, battery_percent=55, last_ping=now - timedelta(minutes=2), status=NodeStatus.Warning),
        IoTNode(id="MF-02", sector_id="VN-MIRAFLORES", ph=7.2,  turbidity=1.1, battery_percent=8,  last_ping=now - timedelta(minutes=5), status=NodeStatus.Warning),
        IoTNode(id="FO-01", sector_id="VN-FORESTAL",   ph=7.3,  turbidity=1.4, battery_percent=88, last_ping=now - timedelta(minutes=1), status=NodeStatus.Online),
        IoTNode(id="RN-05", sector_id="VN-RENACA",     ph=7.0,  turbidity=0.9, battery_percent=77, last_ping=now - timedelta(minutes=2), status=NodeStatus.Online),
        IoTNode(id="RC-04", sector_id="VN-RECREO",     ph=None, turbidity=None, battery_percent=0, last_ping=now - timedelta(hours=4),   status=NodeStatus.Offline),
        IoTNode(id="RC-06", sector_id="VN-RECREO",     ph=7.5,  turbidity=1.2, battery_percent=63, last_ping=now - timedelta(minutes=1), status=NodeStatus.Online),
    ]

    for s in sectors:
        session.add(s)
    for n in nodes:
        session.add(n)
    session.commit()
