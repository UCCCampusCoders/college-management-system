from datetime import datetime
from typing import Literal
from bson import ObjectId
from fastapi import HTTPException, status
from pydantic import ValidationError
import pandas as pd
from college.db.database import DatabaseConnection
from college.core.logging_config import app_logger
from college.models.program import Program
from college.utils.utilities import PROGRESS_TRACKER


class ProgramMgr:
    def __init__(self, db: DatabaseConnection):
        self.db = db
        self.program_collection = self.db.get_collection_reference("programs")
    
    async def add_program_to_db(self, program: Program):
        try:
            program_data = program.model_dump()
            program_data["created_at"] = datetime.now()
            program_data["updated_at"] = datetime.now()
            result = await self.program_collection.insert_one(program_data)
            return result.inserted_id
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error: " + str(e))

    async def check_program_exists(self, program_id: str):
        try:
            program_object_id = ObjectId(program_id)
            existing_program = await self.program_collection.find_one({"_id": program_object_id})
            return existing_program
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error: " + str(e))
    
    async def update_program_in_db(self, program_id: str, program: Program):
        try:
            existing_program = await self.check_program_exists(program_id)
            if not existing_program:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")

            program_data = program.model_dump()
            program_data["updated_at"] = datetime.now()
            result = await self.program_collection.update_one(
                {"_id": ObjectId(program_id)},
                {"$set": program_data}
            )
            return result
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error: " + str(e))
            
    async def get_program_by_id(self, program_id: str):
        try:
            program = await self.program_collection.find_one({"_id": ObjectId(program_id)})
            if program is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail=f"Program not found")
            program["_id"] = str(program["_id"])
            return program
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error: " + str(e))
    
    async def get_all_programs(self):
        try:
            programs = await self.program_collection.find().to_list(length=None)
            for program in programs:
                program["_id"] = str(program["_id"])
            return programs
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error: " + str(e))
    
    async def delete_program_in_db(self, program_id: str):
        try:
            program_object_id = ObjectId(program_id)
            result = await self.program_collection.update_one(
                {"_id": program_object_id},
                {"$set": {"status": "Deleted", "deleted_at": datetime.now()}}
            )
            return result.modified_count
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error: " + str(e))
    
    async def process_program_csv(self, file_path: str, task_id: str):
        try:
            df = pd.read_csv(file_path)
            total_rows = len(df)
            PROGRESS_TRACKER[task_id]["total"] = total_rows
            errors = []

            for i, (_, row) in enumerate(df.iterrows()):
                raw = row.to_dict()

                try:
                    program = Program(**raw)
                    await self.add_program_to_db(program)
                    PROGRESS_TRACKER[task_id]["successfull"] += 1
                except ValidationError as ve:
                    err_msg = "; ".join(
                        [f"{e['loc'][0]}: {e['msg']}" for e in ve.errors()])
                    errors.append({**raw, "error": err_msg})
                except Exception as db_ex:
                    errors.append({**raw, "error": str(db_ex)})

                PROGRESS_TRACKER[task_id]["processed"] = i + 1
                PROGRESS_TRACKER[task_id]["progress"] = int(
                    ((i + 1) / total_rows) * 100)

            if errors:
                error_path = file_path.replace(".csv", "_errors.csv")
                pd.DataFrame(errors).to_csv(error_path, index=False)
                PROGRESS_TRACKER[task_id]["error_file"] = error_path
                PROGRESS_TRACKER[task_id]["failed"] = len(errors)

            PROGRESS_TRACKER[task_id]["status"] = "completed"
            app_logger.info(PROGRESS_TRACKER[task_id])

        except Exception as e:
            PROGRESS_TRACKER[task_id]["status"] = f"failed: {str(e)}"
    
    async def get_programs_by_status(self, program_status: Literal["Active", "Inactive", "Deleted"]):
        try:
            programs = await self.program_collection.find({"status": program_status}).to_list(length=None)
            for program in programs:
                program["_id"] = str(program["_id"])
            return programs
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error: " + str(e))