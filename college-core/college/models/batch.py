from typing import Literal, Optional
from pydantic import BaseModel


class Batch(BaseModel):
    batch_name: str
    faculty_in_charge: Optional[str] = None
    program_id: Optional[str] = None
    semester: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Literal["Active", "Inactive", "Deleted"] = "Active"