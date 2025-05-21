from datetime import datetime
from logging.handlers import TimedRotatingFileHandler
import os
import logging
from college.core.config import config


class LoggerSetup:
    def __init__(self, name: str, sub_dir: str):
        self.logger_name = name
        self.sub_dir = sub_dir
        self.log_level = config.LOG_LEVEL
        self.log_dir = os.path.join(config.LOG_DIR, sub_dir)
        date_str = datetime.now().strftime("%Y-%m-%d")
        self.log_file = os.path.join(self.log_dir, f"{name}_{date_str}.log")
        os.makedirs(self.log_dir, exist_ok=True)

        self.logger = self.setup_logger()

    def setup_logger(self):
        logger = logging.getLogger(self.logger_name)
        logger.setLevel(self.log_level)
        logger.propagate = False

        if logger.hasHandlers():
            logger.handlers.clear()

        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s")

        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)

        file_handler = TimedRotatingFileHandler(
            filename=self.log_file,
            when="midnight",
            interval=1,
            backupCount=7,
            encoding="utf-8",
            utc=True
        )
        file_handler.suffix = "%Y-%m-%d.log"
        file_handler.setFormatter(formatter)

        if not logger.handlers:
            logger.addHandler(console_handler)
            logger.addHandler(file_handler)

        return logger

    def get_logger(self):
        return self.logger


app_logger = LoggerSetup("app", "app_logs").get_logger()
request_logger = LoggerSetup("requests", "request_logs").get_logger()
