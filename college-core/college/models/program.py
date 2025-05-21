from typing import Literal
from pydantic import BaseModel


class Program(BaseModel):
    program_name: str
    status: Literal["Active", "Inactive", "Deleted"] = "Active"