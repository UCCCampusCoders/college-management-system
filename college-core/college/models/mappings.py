from typing import Optional
from pydantic import BaseModel


class CourseAssignment(BaseModel):
    course_id: str
    batch_id: Optional[str] = None
    faculty_id: str
