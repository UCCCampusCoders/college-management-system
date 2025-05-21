from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
import pandas as pd
from pydantic import ValidationError
from college.db.database import DatabaseConnection
from college.models.faculty import Faculty, FacultyUpdate
from college.models.user import User, UserUpdate
from college.services.program_services import ProgramMgr
from college.services.user_services import UserMgr
from college.core.logging_config import app_logger
from college.utils.utilities import PROGRESS_TRACKER


class FacultyMgr:
    def __init__(self, db: DatabaseConnection):
        self.db = db
        self.faculty_collection = self.db.get_collection_reference("faculties")
        self._program_mgr = None
        self._user_mgr = None

    @property
    def program_mgr(self):
        if self._program_mgr is None:
            self._program_mgr = ProgramMgr(self.db)
        return self._program_mgr

    @property
    def user_mgr(self):
        if self._user_mgr is None:
            self._user_mgr = UserMgr(self.db)
        return self._user_mgr
    
    async def check_email_exists(self, email: str):
        try:
            existingData = await self.faculty_collection.find_one({'email': email})
            return existingData
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"An error occurred while checking email. {str(e)}")
    
    async def add_faculty_to_db(self, faculty: Faculty):
        try:
            existing_user = await self.check_email_exists(faculty.email)
            if existing_user:
                app_logger.error(f'Email already registered {faculty.email}')
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
            faculty_data = faculty.model_dump(exclude_none=True)

            faculty_user: User = User(
                first_name=faculty.first_name,
                middle_name=faculty.middle_name if faculty.middle_name else None,
                last_name=faculty.last_name if faculty.last_name else None,
                email=faculty.email,
                role="faculty",
                status="Inactive")
            user_result = await self.user_mgr.add_user_to_db(faculty_user)
            if not user_result:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to insert user into the database",
                )
            faculty_data["user_id"] = str(user_result)
            faculty_data["created_at"] = datetime.now()
            faculty_data["updated_at"] = datetime.now()
            result = await self.faculty_collection.insert_one(faculty_data)
            return result.inserted_id
        except HTTPException as e:
            raise e
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error adding faculty. {str(e)}")
    
    async def get_all_faculties(self):
        try:
            faculties = await self.faculty_collection.find().to_list(length=None)
            for faculty in faculties:
                faculty["_id"] = str(faculty["_id"])
                program = None
                program = await self.program_mgr.get_program_by_id(faculty.get("program_id"))
                faculty["program"] = program
            return faculties
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error occurred while retrieving faculty data. {str(e)} "
            )
    
    async def get_faculty_by_user_id(self, user_id: str):
        try:
            faculty = await self.faculty_collection.find_one({"user_id": user_id})
            if not faculty:
                raise HTTPException(
                    status_code=404, detail=f"Faculty not found")
            faculty["_id"] = str(faculty["_id"])
            if faculty.get("program_id"):
                program = await self.program_mgr.get_program_by_id(faculty.get("program_id"))
                faculty["program"] = program
            return faculty
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"An error occurred while retrieving faculty data {str(e)}")
    
    async def process_faculty_csv(self, file_path: str, task_id: str):
        try:
            df = pd.read_csv(file_path, dtype={"phone_no": str})
            total_rows = len(df)
            PROGRESS_TRACKER[task_id]["total"] = total_rows
            program_map = {
                p["program_name"]: p["_id"] for p in await self.program_mgr.get_all_programs()
            }
            errors = []

            for i, (_, row) in enumerate(df.iterrows()):
                raw = row.to_dict()

                pname = raw.get("program_name")
                if not pname or pname not in program_map:
                    errors.append({**raw, "error": "Program name not found"})
                    continue
                raw["program_id"] = program_map[pname]
                raw.pop("program_name")

                try:
                    faculty = Faculty(**raw)
                    await self.add_faculty_to_db(faculty)
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
    
    async def update_faculty_by_id(self, faculty_id: str, faculty_data: FacultyUpdate):
        try:
            faculty_obj_id = ObjectId(faculty_id)

            raw_data = faculty_data.model_dump()

            set_data = {}
            unset_data = {}

            for key, value in raw_data.items():
                if value == "" or value is None:
                    unset_data[key] = ""
                else:
                    set_data[key] = value

            set_data["updated_at"] = datetime.now()

            update_query = {}
            if set_data:
                update_query["$set"] = set_data
            if unset_data:
                update_query["$unset"] = unset_data

            faculty_user: UserUpdate = UserUpdate(
                first_name=faculty_data.first_name,
                middle_name=faculty_data.middle_name,
                last_name=faculty_data.last_name,
                email=faculty_data.email,
            )
            user_update_result = await self.user_mgr.update_user_in_db(faculty_data.user_id if faculty_data.user_id else "", faculty_user)

            updated_student = await self.faculty_collection.update_one(
                {"_id": faculty_obj_id},
                update_query
            )
            return updated_student.matched_count
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error updating student: {str(e)}")
            