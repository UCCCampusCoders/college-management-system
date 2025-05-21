import os
from dotenv import load_dotenv

load_dotenv()

class BaseConfig:
    def __init__(self):
        # APP CONFIGURATION
        self.APP_NAME = os.getenv("APP_NAME", "ams")
        
        self.SECRET_KEY = os.getenv("SECRET_KEY")
        self.ALGORITHM = os.getenv("ALGORITHM", "HS256")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES",30)
        

        self.UPLOADS_DIR = os.getenv("UPLOADS_DIR","uploads")
        
        # LOG FILE CONFIGURATION
        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "DEBUG")
        self.LOG_DIR = os.getenv("LOG_DIR","logs")
        
        # MONGO DB CONFIGURATION
        self.MONGO_URL = os.getenv("MONGO_DATABASE_URL")
        self.MONGO_USERNAME = os.getenv("MONGO_USERNAME")
        self.MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
        self.MONGO_PORT = os.getenv("MONGO_PORT")
        self.MONGO_DATABASE_NAME = os.getenv("MONGO_DATABASE_NAME","collegedb")
        
        
config = BaseConfig()