from datetime import datetime

def test_dashboard(client):
    response = client.get("/api/autoridad/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "ph_promedio" in data
    assert "nodos_activos" in data
    assert "total_nodos" in data
    assert data["total_nodos"] == 8

def test_sensores(client):
    response = client.get("/api/autoridad/sensores")
    assert response.status_code == 200
    assert len(response.json()) == 8

def test_alertas(client):
    response = client.get("/api/autoridad/alertas")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_resolver_alerta(client, session):
    from domain.entities.alert import Alert
    from domain.enums.alert_level import AlertLevel
    alert = Alert(
        node_id="VN-01", sector_id="VN-CENTRO",
        level=AlertLevel.Critical, type="pH",
        message="test", trigger_value=9.0, sms_sent=1, is_active=True,
    )
    session.add(alert)
    session.commit()

    response = client.post(f"/api/autoridad/alertas/{alert.id}/resolver")
    assert response.status_code == 200

    session.refresh(alert)
    assert alert.is_active == False

def test_graficos(client):
    response = client.get("/api/graficos/VN-CENTRO")
    assert response.status_code == 200
    data = response.json()
    assert "labels" in data
    assert "ph" in data
    assert "turbidity" in data
