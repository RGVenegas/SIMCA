# Frontend — SIMCA

Interfaz web del sistema, hecha en React + Vite.

## Levantar en desarrollo

```bash
npm install
npm run dev
```

Queda disponible en http://localhost:5173

El frontend se conecta al backend en `http://localhost:8000/api`. Si el backend no está corriendo, las páginas cargan pero no muestran datos.

## Estructura

```
src/
├── components/   ← componentes reutilizables (Navbar, MetricCard, etc.)
├── pages/
│   ├── autoridad/   ← Dashboard, Sensores, Alertas, Reportes
│   └── habitante/   ← Estado, Historial
├── utils/
│   └── api.js    ← funciones para llamar al backend
└── assets/
    └── simca.css ← estilos globales del sistema
```

## Build para producción

```bash
npm run build
```

Los archivos quedan en `dist/`, listos para servir estáticamente.
