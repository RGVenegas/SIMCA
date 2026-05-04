# SIMCA — Sistema de Monitoreo y Alerta de Calidad de Agua

Sistema IoT para el monitoreo en tiempo real de la calidad del agua en sectores de Viña del Mar, Región de Valparaíso. Recibe lecturas de sensores (pH y turbidez), evalúa el estado del agua y emite alertas automáticas ante condiciones anómalas.

---

## Equipo

| Nombre | Rol |
|--------|-----|
| Axel Antezana | Desarrollo |
| Pablo Loncon | Desarrollo |
| Rodrigo Venegas | Desarrollo |

Universidad Andrés Bello — Ingeniería de Software

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3.11+, FastAPI, SQLModel |
| Base de datos | SQLite |
| Frontend | HTML + CSS + JavaScript puro |
| Gráficos | Chart.js (CDN) |
| Mapa | Leaflet.js + OpenStreetMap (CDN) |
| Pruebas | pytest + httpx |
| Simulador IoT | `simulator.py` (script independiente) |

---

## Requisitos

- Python 3.11+
- pip

---

## Instalación

```bash
cd backend
pip install -r requirements.txt
```

---

## Ejecución

**Terminal 1 — Servidor backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Simulador IoT:**
```bash
cd backend
python simulator.py
```

Abrir en el navegador: [http://localhost:8000](http://localhost:8000)

> El simulador envía lecturas cada 15 segundos desde 7 nodos IoT distribuidos en Viña del Mar, con ~15% de probabilidad de generar anomalías para disparar alertas.

---

## Pruebas

```bash
cd backend
pytest tests/ -v
```

| Suite | Tests | Descripción |
|-------|-------|-------------|
| `tests/unit/test_water_quality_service.py` | 13 | Clasificación SAFE / WARNING / CONTAMINATED |
| `tests/unit/test_alert_service.py` | — | Creación y resolución de alertas |
| `tests/integration/test_sensores.py` | — | POST lectura, GET nodos |
| `tests/integration/test_habitante.py` | — | Estado sector, historial |

Ver `backend/docs/pruebas.md` para resultados detallados.

---

## Estructura del proyecto

```
Simca v3/
├── backend/
│   ├── domain/           ← Entidades, enums, ports (interfaces ABC)
│   ├── application/      ← WaterQualityService, AlertService
│   ├── infrastructure/   ← SQLiteRepository, MockSmsService, seed_data
│   ├── api/              ← Routers FastAPI, schemas Pydantic
│   ├── simulator.py      ← Simulador IoT
│   ├── main.py           ← Punto de entrada
│   ├── requirements.txt
│   └── tests/
│       ├── unit/
│       └── integration/
└── frontend/
    ├── index.html         ← Selección de rol
    ├── habitante/         ← Vistas rol Habitante
    ├── autoridad/         ← Vistas rol Autoridad Sanitaria
    ├── css/simca.css
    └── js/
        ├── config.js
        └── simca.js
```

---

## Páginas disponibles

| URL | Rol | Descripción |
|-----|-----|-------------|
| `/` | Todos | Selección de rol |
| `/habitante/estado.html` | Habitante | Estado del agua por sector |
| `/habitante/historial.html` | Habitante | Historial de alertas del sector |
| `/autoridad/dashboard.html` | Autoridad | Dashboard con métricas globales y mapa |
| `/autoridad/sensores.html` | Autoridad | Estado de todos los nodos IoT |
| `/autoridad/alertas.html` | Autoridad | Gestión y resolución de alertas activas |
| `/autoridad/reportes.html` | Autoridad | Gráficos históricos por sector |

---

## API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/sensores/lectura` | Recibe lectura de un sensor |
| `GET` | `/api/sectores` | Lista todos los sectores |
| `GET` | `/api/habitante/estado?sector=ID` | Estado del agua de un sector |
| `GET` | `/api/habitante/historial?sector=ID` | Historial de alertas de un sector |
| `GET` | `/api/autoridad/dashboard` | Métricas globales del sistema |
| `GET` | `/api/autoridad/sensores` | Estado de todos los nodos |
| `GET` | `/api/autoridad/alertas` | Alertas activas |
| `GET` | `/api/autoridad/reportes` | Datos históricos para gráficos |
| `POST` | `/api/autoridad/alertas/{id}/resolver` | Resuelve una alerta |
| `GET` | `/api/graficos/{sector_id}` | Datos de gráficos por sector |

---

## Lógica de calidad del agua

| Estado | Condición | Acción |
|--------|-----------|--------|
| `SAFE` | pH 6.5–8.5 y turbidez ≤ 3.5 NTU | — |
| `WARNING` | Turbidez entre 3.5 y 5.0 NTU | Alerta registrada |
| `CONTAMINATED` | pH < 6.5 o pH > 8.5 | Alerta + notificación SMS (mock) |
| `CONTAMINATED` | Turbidez > 5.0 NTU | Alerta + notificación SMS (mock) |

---

## Sectores monitoreados — Viña del Mar

| ID | Sector | Nodos |
|----|--------|-------|
| VN-CENTRO | Viña Centro | VN-01, VN-03 |
| VN-MIRAFLORES | Miraflores Alto | MF-02, MF-07 |
| VN-FORESTAL | Sector Forestal | FO-01 |
| VN-RENACA | Reñaca | RN-05 |
| VN-RECREO | Recreo | RC-04 (offline), RC-06 |

---

## Estado del proyecto

| Sprint | Contenido | Estado |
|--------|-----------|--------|
| Sprint 1 | Dominio, entidades, infra SQLite, simulador IoT, frontend base | ✅ Completado |
| Sprint 2 | WaterQualityService, AlertService, API REST completa, pruebas unitarias | ✅ Completado |
