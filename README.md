# SIMCA v3

Sistema de Monitoreo y Alerta de Calidad de Agua — Viña del Mar, Región de Valparaíso.

## Requisitos

- Python 3.11+

## Instalación

```bash
cd backend
pip install -r requirements.txt
```

## Ejecutar

**Terminal 1 — Backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Simulador IoT:**
```bash
cd backend
python simulator.py
```

Abrir en el navegador: http://localhost:8000

## Pruebas

```bash
cd backend
pytest tests/ -v
```

Ver `backend/docs/pruebas.md` para documentación completa.

## Estructura

```
Simca v3/
├── backend/    ← FastAPI + SQLModel + SQLite
└── frontend/   ← HTML + CSS + JS (Chart.js, Leaflet)
```

## Páginas

| URL | Descripción |
|---|---|
| `/` | Selección de rol |
| `/habitante/estado.html` | Estado del agua por sector |
| `/habitante/historial.html` | Historial de alertas |
| `/autoridad/dashboard.html` | Dashboard con métricas y mapa |
| `/autoridad/sensores.html` | Estado de nodos IoT |
| `/autoridad/alertas.html` | Gestión de alertas |
| `/autoridad/reportes.html` | Gráficos históricos |
