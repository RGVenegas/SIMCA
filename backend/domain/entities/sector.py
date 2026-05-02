from typing import Optional
from sqlmodel import Field, SQLModel

class Sector(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    comuna: str
    population: int
    phone_numbers: str = ""
