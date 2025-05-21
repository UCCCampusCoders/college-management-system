from typing import Literal, Optional
from pydantic import BaseModel


class User(BaseModel):
    first_name: str
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    role: Literal["admin", "faculty", "student"]
    status: Literal["Active", "Inactive"]

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[Literal["admin", "faculty", "student"]] = None
    status: Optional[Literal["Active", "Inactive"]] = None