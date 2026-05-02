from sqlmodel import select
from domain.entities.alert import Alert

def test_lectura_safe_no_genera_alerta(client, session):
    response = client.post("/api/sensores/lectura", json={
        "node_id": "VN-03", "sector_id": "VN-CENTRO",
        "ph": 7.2, "turbidity": 1.0
    })
    assert response.status_code == 200
    assert response.json()["status"] == "SAFE"
    alertas = session.exec(select(Alert).where(Alert.sector_id == "VN-CENTRO")).all()
    assert all(not a.is_active for a in alertas) or len(alertas) == 0

def test_lectura_critica_genera_alerta(client, session):
    response = client.post("/api/sensores/lectura", json={
        "node_id": "VN-03", "sector_id": "VN-CENTRO",
        "ph": 9.5, "turbidity": 1.0
    })
    assert response.status_code == 200
    assert response.json()["status"] == "CONTAMINATED"
    alertas = session.exec(
        select(Alert).where(Alert.sector_id == "VN-CENTRO").where(Alert.is_active == True)
    ).all()
    assert len(alertas) >= 1

def test_lectura_ph_invalido_rechazada(client, session):
    response = client.post("/api/sensores/lectura", json={
        "node_id": "VN-03", "sector_id": "VN-CENTRO",
        "ph": 20.0, "turbidity": 1.0
    })
    assert response.status_code == 422

def test_lectura_actualiza_nodo(client, session):
    client.post("/api/sensores/lectura", json={
        "node_id": "VN-03", "sector_id": "VN-CENTRO",
        "ph": 7.1, "turbidity": 0.9
    })
    from domain.entities.iot_node import IoTNode
    node = session.get(IoTNode, "VN-03")
    assert node.ph == 7.1
