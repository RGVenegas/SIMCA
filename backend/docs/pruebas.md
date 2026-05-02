# Documentación de Pruebas — SIMCA v3

## Ejecutar todas las pruebas

```bash
cd backend
pytest tests/ -v
```

## Suites de pruebas

### Unit Tests (`tests/unit/`)
Prueban la lógica de dominio pura, sin base de datos ni HTTP.

| Archivo | Qué prueba |
|---|---|
| `test_water_quality_service.py` | `determine_status()` con pH/turbidez en rango normal, warning y crítico; `evaluate_reading()` con pH inválido; generación de alertas |
| `test_alert_service.py` | Resolución de alertas; listado de alertas activas |

```bash
pytest tests/unit/ -v
```

### Integration Tests (`tests/integration/`)
Prueban los endpoints con base de datos SQLite en memoria aislada.

| Archivo | Qué prueba |
|---|---|
| `test_sensores.py` | POST lectura safe/crítica/inválida; actualización de nodo |
| `test_habitante.py` | GET sectores; GET estado por sector; GET historial |
| `test_autoridad.py` | GET dashboard; GET sensores; POST resolver alerta; GET gráficos |

```bash
pytest tests/integration/ -v
```

## Fixtures (`tests/conftest.py`)

- `session`: SQLite en memoria con seed data (5 sectores, 8 nodos)
- `client`: `TestClient` de FastAPI con sesión de prueba inyectada

## Thresholds de calidad del agua

| Parámetro | Safe | Warning | Contaminated |
|---|---|---|---|
| pH | 6.5 – 8.5 | — | < 6.5 o > 8.5 |
| Turbidez | ≤ 3.5 NTU | 3.5 – 5.0 NTU | > 5.0 NTU |
