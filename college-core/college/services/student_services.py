from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
import pandas as pd
from pydantic import ValidationError
from college.db.database import DatabaseConnection
from college.models.student import Student, StudentUpdate
from college.models.user import User, UserUpdate
from college.services.batch_services import BatchMgr
from college.services.faculty_services import FacultyMgr
from college.services.program_services import ProgramMgr
from college.services.user_services import UserMgr
from college.core.logging_config import app_logger
from college.utils.utilities import PROGRESS_TRACKER


class StudentMgr:
    def __init__(self, db: DatabaseConnection):
        self.db = db
        self.student_collection = self.db.get_collection_reference("students")
        self._user_mgr = None
        self._batch_mgr = None
        self._faculty_mgr = None
        self._program_mgr = None

    @property
    def user_mgr(self):
        if self._user_mgr is None:
            self._user_mgr = UserMgr(self.db)
        return self._user_mgr
    
    @property
    def faculty_mgr(self):
        if self._faculty_mgr is None:
            self._faculty_mgr = FacultyMgr(self.db)
        return self._faculty_mgr
    
    @property
    def batch_mgr(self):
        if self._batch_mgr is None:
            self._batch_mgr = BatchMgr(self.db)
        return self._batch_mgr
    
    @property
    def program_mgr(self):
        if self._program_mgr is None:
            self._program_mgr = ProgramMgr(self.db)
        return self._program_mgr
    
    async def add_student_to_db(self, student: Student):
        try:
            existing_user = await self.check_email_exists(student.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, detail=f"Email already registered")
            student_data = student.model_dump(exclude_none=True)
            student_user: User = User(
                first_name=student.first_name,
                middle_name=student.middle_name if student.middle_name else None,
                last_name=student.last_name if student.last_name else None,
                email=student.email,
                role="student",
                status="Inactive")
            user_result = await self.user_mgr.add_user_to_db(student_user)
            if not user_result:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to insert user into the database"
                )
            student_data["user_id"] = str(user_result)
            student_data["created_at"] = datetime.now()
            student_data["updated_at"] = datetime.now()
            result = await self.student_collection.insert_one(student_data)
            return result

        except HTTPException as e:
            app_logger.error(str(e))
            raise e
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error adding student to db, {str(e)}")

    async def check_email_exists(self, email: str):
        try:
            existingData = await self.student_collection.find_one({'email': email})
            return existingData
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"An error occurred while checking email, {str(e)}")

    async def get_all_students(self):
        try:
            students = await self.student_collection.find().to_list(length=None)
            for student in students:
                student["_id"] = str(student["_id"])
                if student.get("program_id"):
                    program = None
                    program = await self.program_mgr.get_program_by_id(student["program_id"])
                    student["program"] = program
                if student.get("batch_id"):
                    batch = None
                    batch = await self.batch_mgr.get_batch_by_id(student.get("batch_id"))
                    student["batch"] = batch
            return students
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"An Error occurred while retrieving student data, {str(e)}")

    async def get_student_by_user_id(self, user_id: str):
        try:
            student = await self.student_collection.find_one({"user_id": user_id})
            if student:
                student["_id"] = str(student["_id"])
                if student.get("program_id"):
                    program = None
                    program = await self.program_mgr.get_program_by_id(student["program_id"])
                    student["program"] = program
                if student.get("batch_id"):
                    batch = None
                    batch = await self.batch_mgr.get_batch_by_id(student.get("batch_id"))
                    student["batch"] = batch
            return student
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching student details, {str(e)}")

    async def update_student_by_id(self, student_id: str, student: StudentUpdate):
        try:
            student_obj_id = ObjectId(student_id)

            raw_data = student.model_dump()

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

            student_user: UserUpdate = UserUpdate(
                first_name=student.first_name,
                middle_name=student.middle_name,
                last_name=student.last_name,
                email=student.email,
            )
            user_update_result = await self.user_mgr.update_user_in_db(student.user_id if student.user_id else "", student_user)

            updated_student = await self.student_collection.update_one(
                {"_id": student_obj_id},
                update_query
            )
            return updated_student.matched_count
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error updating student: {str(e)}")
    
    async def process_student_csv(self, file_path: str, task_id: str):
        try:
            df = pd.read_csv(file_path, dtype={
                             "phone_no": str, "adm_year": str})
            total_rows = len(df)
            PROGRESS_TRACKER[task_id]["total"] = total_rows
            program_map = {
                p["program_name"]: p["_id"] for p in await self.program_mgr.get_all_programs()
            }

            batch_map = {
                b["batch_name"]: b["_id"] for b in await self.batch_mgr.get_all_batches()
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

                bname = raw.get("batch_name")
                if bname:
                    if bname not in batch_map:
                        errors.append({**raw, "error": "Batch name not found"})
                        continue
                    raw["batch_id"] = batch_map[bname]
                    raw.pop("batch_name")

                try:
                    student = Student(**raw)
                    await self.add_student_to_db(student)
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