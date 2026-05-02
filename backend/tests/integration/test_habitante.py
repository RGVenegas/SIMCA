def test_get_sectores(client):
    response = client.get("/api/sectores")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5
    ids = [s["id"] for s in data]
    assert "VN-CENTRO" in ids

def test_estado_sector_valido(client):
    response = client.get("/api/habitante/estado?sector=VN-CENTRO")
    assert response.status_code == 200
    data = response.json()
    assert data["sector_id"] == "VN-CENTRO"
    assert "water_status" in data
    assert "ph" in data

def test_estado_sector_invalido(client):
    response = client.get("/api/habitante/estado?sector=NO-EXISTE")
    assert response.status_code == 404

def test_historial_sector(client):
    response = client.get("/api/habitante/historial?sector=VN-CENTRO")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
