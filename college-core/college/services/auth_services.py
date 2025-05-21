from datetime import datetime, timedelta
from jose import jwt
from college.core.config import config

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    if config.SECRET_KEY is None:
            raise ValueError("SECRET_KEY is not set in the config.")
    return jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)