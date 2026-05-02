from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session
from api.schemas.response_schemas import SectorResponse
from infrastructure.database import get_session
from infrastructure.repositories.sqlite_repository import SQLiteRepository

router = APIRouter()

@router.get("/sectores", response_model=List[SectorResponse])
def get_sectores(session: Session = Depends(get_session)):
    repo = SQLiteRepository(session)
    return repo.get_all_sectors()
