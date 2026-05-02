from fastapi import APIRouter, Depends
from sqlmodel import Session
from api.schemas.response_schemas import GraficosResponse
from infrastructure.database import get_session
from infrastructure.repositories.sqlite_repository import SQLiteRepository

router = APIRouter()

@router.get("/graficos/{sector_id}", response_model=GraficosResponse)
def get_graficos(sector_id: str, session: Session = Depends(get_session)):
    repo = SQLiteRepository(session)
    readings = repo.get_by_sector(sector_id, hours=12)
    return GraficosResponse(
        sector_id=sector_id,
        labels=[r.recorded_at.strftime("%H:%M") for r in readings],
        ph=[r.ph for r in readings],
        turbidity=[r.turbidity for r in readings],
    )
