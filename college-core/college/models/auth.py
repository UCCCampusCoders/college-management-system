from pydantic import BaseModel


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    email: str
    role: str
    status: str