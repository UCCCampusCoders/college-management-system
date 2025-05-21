import random
import string
from typing import Optional
from passlib.context import CryptContext
import csv
import re
import os
from datetime import datetime
from college.core.config import config

PROGRESS_TRACKER = {}


class UtilMgr:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.error_files_directory = config.LOG_DIR+"/error_logs/"

    def is_valid_password(self, password: str) -> bool:
        # Check if password length is greater than 10
        if len(password) < 10:
            return False
        # Check for at least one capital letter, one small letter, one digit, and one special character
        if not re.search(r'[A-Z]', password):  # Capital letter
            return False
        if not re.search(r'[a-z]', password):  # Small letter
            return False
        if not re.search(r'[0-9]', password):  # Digit
            return False
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):  # Special character
            return False
        # If all conditions are met, return True
        return True

    def is_valid_name(self, name: str) -> bool:
        return bool(name.strip())

    def is_valid_email(self, email: str) -> bool:
        pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
        return re.match(pattern, email) is not None

    def validate_csv(self, file_path: str, output_error_file: str) -> str:
        invalid_data = []
        # Open and read the CSV file
        with open(file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            # Process each row of the CSV
            for row in reader:
                errors = []
                # Validate Name
                if not self.is_valid_name(row['name']):
                    errors.append("Invalid name (name can't be empty)")
                # Validate Email
                if not self.is_valid_email(row['email']):
                    errors.append("Invalid email format")
                # Validate Password
                if not self.is_valid_password(row['password']):
                    errors.append(
                        "Invalid password (must be > 10 chars, include 1 capital letter, 1 small letter, 1 number, 1 special character)")
                # If there are any errors, save the row and the errors
                if errors:
                    invalid_data.append({
                        'name': row['name'],
                        'email': row['email'],
                        'password': row['password'],
                        # Join multiple errors in one string
                        'errors': ', '.join(errors)
                    })
        # Write the errors to an output CSV file
        if invalid_data:
            with open(output_error_file, mode='w', newline='', encoding='utf-8') as errorfile:
                fieldnames = ['name', 'email', 'password', 'errors']
                writer = csv.DictWriter(errorfile, fieldnames=fieldnames)

                writer.writeheader()  # Write header
                for data in invalid_data:
                    writer.writerow(data)
            print(f"Error file has been created: {output_error_file}")
            return output_error_file
        else:
            return "All data is valid!"

    #def validateStudentData(self, student: Student):
        
    def create_error_file(self) -> str:
        current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"errorfile_{current_time}.txt"
        file_path = os.path.join(self.error_files_directory, filename)
        return file_path

    def hash_password(self, password: str) -> str:
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def generate_random_string(self,length: int = 10, chars: str = string.ascii_letters + string.digits):
        return ''.join(random.choice(chars) for _ in range(length))
