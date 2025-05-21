from typing import Literal, Optional
from pydantic import BaseModel


class Course(BaseModel):
    course_code: str
    course_name: str
    semester: int
    program_id: Optional[str] = None
    status: Literal["Active", "Inactive", "Deleted"] = "Active"