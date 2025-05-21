from datetime import date
from typing import Annotated, Literal, Optional
from pydantic import BaseModel, EmailStr, constr


class Faculty(BaseModel):
    user_id: Optional[str] = None
    first_name: str
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    phone_no: Annotated[str, constr(min_length=10, max_length=10)]
    gender: Optional[Literal["Male", "Female", "Others"]] = None
    dob: Optional[date] = None
    program_id: str
    join_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Literal["Active", "Resigned"] = "Active"


class FacultyUpdate(BaseModel):
    user_id: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[Literal["Male", "Female", "Others"]] = None
    email: Optional[EmailStr] = None
    phone_no: Optional[Annotated[str, constr(
        min_length=10, max_length=10)]] = None
    join_date: Optional[date] = None
    end_date: Optional[date] = None
    program_id: Optional[str] = None
    status: Optional[Literal["Active", "Resigned"]] = None
