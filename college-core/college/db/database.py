from typing import Optional
from pymongo import AsyncMongoClient
from pymongo.asynchronous.collection import AsyncCollection
import asyncio
from college.core.config import config
from college.core.logging_config import app_logger


class DatabaseConnection:
    _instance: Optional["DatabaseConnection"] = None

    def __new__(cls):
        """Ensure only one instance of the database connection is created."""
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
        return cls._instance

    def __init__(self, max_retries=5, retry_delay=2):
        if not hasattr(self, 'client'):
            self.database_url = config.MONGO_URL
            self.database_name = config.MONGO_DATABASE_NAME
            self.mongo_username = config.MONGO_USERNAME
            self.mongo_password = config.MONGO_PASSWORD
            self.mongo_port = config.MONGO_PORT
            self.max_retries = max_retries
            self.retry_delay = retry_delay
            self.client= None
            self.db = None
            self._connected = False

    async def connect(self):
        if self._connected:
            return
        
        if not self.database_url:
            if not self.mongo_password and not self.mongo_port and not self.mongo_username:
                app_logger.error(
                    f'Database URL or credentials not set. Check your configuration.')
                raise ValueError(
                    "Database URL or credentials not set. Check your configuration.")
            else:
                self.database_url = f"mongodb://{self.mongo_username}:{self.mongo_password}@localhost:{self.mongo_port}"

        retries = 0
        while retries < self.max_retries:
            try:
                if not self.client:
                    self.client= AsyncMongoClient(self.database_url)
                    self.db = self.client.get_database(self.database_name)
                    await self.db.command("ping")
                    app_logger.info(
                        f'Connected to MongoDB at {self.database_url} | using database {self.database_name}')
                    self._connected = True
                    return

            except (ValueError, Exception) as e:
                retries += 1
                print(f"Attempt {retries} failed: {e}")

                if retries >= self.max_retries:
                    raise Exception(
                        f"Failed to connect to MongoDB after {self.max_retries} attempts.")

                delay = self.retry_delay * (2 ** (retries - 1))
                print(f"Retrying in {delay} seconds...")
                await asyncio.sleep(delay)

    async def close(self):
        if self.client:
            await self.client.close()
            self.client = None
            self.db = None
            self._connected = False
            app_logger.info(f'Connection to {self.database_name} closed.')
            print(f"Connection to {self.database_name} closed.")
        else:
            print("No connection to close.")

    def get_collection_reference(self, collection_name: str) -> AsyncCollection:
        if self.db is None:
            app_logger.error(
                f'Database is not connected for getting Collection info')
            raise Exception("Database is not connected!")
        return self.db.get_collection(collection_name)


def get_db():
    return DatabaseConnection()