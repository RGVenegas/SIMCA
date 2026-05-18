import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from infrastructure.database import create_db_and_tables, engine, get_session
from infrastructure.seed_data import seed_database
from api.routers import sensores, sectores, habitante, autoridad, graficos

logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    with Session(engine) as session:
        seed_database(session)
    yield

app = FastAPI(title="SIMCA API", version="5.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sensores.router, prefix="/api", tags=["sensores"])
app.include_router(sectores.router, prefix="/api", tags=["sectores"])
app.include_router(habitante.router, prefix="/api", tags=["habitante"])
app.include_router(autoridad.router, prefix="/api", tags=["autoridad"])
app.include_router(graficos.router, prefix="/api", tags=["graficos"])
