from pydantic import BaseModel, Field

class LecturaRequest(BaseModel):
    node_id: str
    sector_id: str
    ph: float = Field(ge=0, le=14)
    turbidity: float = Field(ge=0)
