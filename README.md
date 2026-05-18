# SIMCA — Sistema de Monitoreo y Alerta de Calidad de Agua

Proyecto del ramo de Ingeniería de Software — Universidad Andrés Bello.
Monitorea la calidad del agua en tiempo real en distintos sectores de Viña del Mar, Región de Valparaíso.

## ¿Qué hace el sistema?

El sistema recibe lecturas de pH y turbidez desde los nodos IoT (los simulamos porque obviamente no tenemos sensores reales en Viña). Con eso clasifica si el agua está OK, en advertencia o contaminada, y dispara una alerta cuando algo está mal. Todo se ve en un dashboard con mapa y gráficos en tiempo real. Si la alerta es crítica, también se simula el envío de un SMS a la autoridad sanitaria.

## Requisitos

- Python 3.11+
- Node 18+

## Cómo levantar el sistema

Hay dos formas de levantar el backend: manual o con Docker. El frontend siempre se levanta igual.

### Opción A — Manual 

Necesitan al menos dos terminales abiertas.

**Terminal 1 — Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Abrir en el navegador: http://localhost:5173

**Opcional — Simulador IoT** (Terminal 3):
```bash
cd backend
python3 simulator.py
```

Sin el simulador los nodos no envían lecturas nuevas, pero el sistema igual arranca con datos de seed.

### Opción B — Docker (solo el backend)

Si tienen Docker instalado, pueden levantar el backend y el simulador con un solo comando:

```bash
docker compose up --build
```

Esto levanta el backend en el puerto 8000 y arranca el simulador automáticamente.
El frontend igual hay que correrlo aparte:

```bash
cd frontend
npm install
npm run dev
```

Abrir en el navegador: http://localhost:5173

## Pruebas

```bash
cd backend
pytest tests/ -v
```

Ver `backend/docs/pruebas.md` para más detalle de qué prueba cada suite.

## Estructura del proyecto

```
SimcaBetaV3/
├── backend/              ← FastAPI + SQLite, arquitectura limpia
│   ├── api/              ← routers y schemas
│   ├── application/      ← servicios de dominio
│   ├── domain/           ← entidades y puertos
│   ├── infrastructure/   ← repositorios, BD, notificaciones
│   ├── tests/            ← unit + integration
│   ├── main.py
│   └── simulator.py
├── frontend/             ← React + Vite
│   └── src/
│       ├── components/
│       ├── pages/
│       └── utils/
├── docker-compose.yml
└── start.sh
```

## Vistas principales

| Ruta | Descripción |
|---|---|
| `/` | Selección de rol (habitante o autoridad) |
| `/habitante/estado` | Estado del agua por sector |
| `/habitante/historial` | Historial de alertas |
| `/autoridad/dashboard` | Dashboard principal con métricas, gráficos y mapa |
| `/autoridad/sensores` | Estado de nodos IoT |
| `/autoridad/alertas` | Listado y gestión de alertas |
| `/autoridad/reportes` | Gráficos históricos por sector |

## Decisiones técnicas

- Usamos FastAPI porque es simple, rápido de levantar y tiene validación automática con Pydantic
- El frontend lo hicimos en React con Vite (nos recomendaron usar un framework para el frontend)
- Los tests de integración usan SQLite en memoria para que sean aislados y rápidos
