from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status
import pandas as pd
from pydantic import ValidationError
from college.db.database import DatabaseConnection
from college.models.course import Course
from college.models.mappings import CourseAssignment
from college.services.faculty_services import FacultyMgr
from college.services.mapping_services import MappingMgr
from college.services.program_services import ProgramMgr
from college.core.logging_config import app_logger
from college.utils.utilities import PROGRESS_TRACKER


class CourseMgr:
    def __init__(self, db: DatabaseConnection):
        self.db = db
        self.course_collection = self.db.get_collection_reference("courses")
        self._program_mgr = None
        self._faculty_mgr = None
        self._mapping_mgr = None
    
    @property
    def faculty_mgr(self):
        if self._faculty_mgr is None:
            self._faculty_mgr = FacultyMgr(self.db)
        return self._faculty_mgr

    @property
    def program_mgr(self):
        if self._program_mgr is None:
            self._program_mgr = ProgramMgr(self.db)
        return self._program_mgr
    
    @property
    def mapping_mgr(self):
        if self._mapping_mgr is None:
            self._mapping_mgr = MappingMgr(self.db)
        return self._mapping_mgr
    
    async def check_course_code_exists(self, course_code: str):
        try:
            course = await self.course_collection.find_one({'course_code': course_code})
            return course
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error checking course code. {str(e)}")

    async def add_course_to_db(self, course: Course):
        try:
            course_data = course.model_dump(exclude_none=True)
            existing_course = await self.check_course_code_exists(course_data['course_code'])
            if existing_course:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT, detail=f"Course code already exists")
            course_data["created_at"] = datetime.now()
            course_data["updated_at"] = datetime.now()
            result = await self.course_collection.insert_one(course_data)
            return result
        except HTTPException as e:
            app_logger.error(str(e))
            raise e
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error adding course. {str(e)} ")

    async def get_all_courses(self):
        try:
            courses = await self.course_collection.find().to_list(length=None)
            for course in courses:
                course["_id"] = str(course["_id"])
                if course.get("program_id"):
                    program = None
                    program = await self.program_mgr.get_program_by_id(course.get("program_id"))
                    course["program"] = program
            return courses
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.WS_1011_INTERNAL_ERROR,
                                detail=f"Error retrieving course data{str(e)}")

    async def delete_course_in_db(self, course_id: str):
        try:
            course_object_id = ObjectId(course_id)
            result = await self.course_collection.update_one(
                {"_id": course_object_id},
                {"$set": {
                    "status": "Deleted",
                    "deleted_at": datetime.now()
                }}
            )
            return result.modified_count
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error deleting course. {str(e)} ")

    async def update_course_in_db(self, course_id: str, course: Course):
        try:
            course_object_id = ObjectId(course_id)

            raw_data = course.model_dump()

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

            result = await self.course_collection.update_one(
                {"_id": course_object_id},
                update_query
            )

            return result.modified_count
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=400, detail=f"Error updating course info, {str(e)}")

    async def get_course_by_id(self, course_id: str):
        try:
            course_object_id = ObjectId(course_id)
            course = await self.course_collection.find_one({"_id": course_object_id})
            if course is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
            course["_id"] = str(course["_id"])
            if course.get("program_id") not in (None, ""):
                program = None
                program = await self.program_mgr.get_program_by_id(course["program_id"])
                course["program"] = program
            assignments = await self.mapping_mgr.get_course_assignments(course_id)
            if assignments is not None:
                course["assignments"] = assignments
            return course
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error in getting course, {str(e)} ")

    async def assign_course(self, course_id, assignment_data: CourseAssignment):
        try:
            course_object_id = ObjectId(course_id)
            course = await self.course_collection.find_one({"_id": course_object_id})
            if course is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

            # Add to active assignment
            result = await self.mapping_mgr.add_course_assignment(assignment_data)
            if not result:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to insert course assignment into the database",)

            # Save to assignment history
            dict_data = assignment_data.model_dump(exclude_none=True)
            dict_data["status"] = "Assigned"
            dict_data["assigned_date"] = datetime.now()
            result = await self.mapping_mgr.save_course_assignment(dict_data)
            if not result:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to save in assignment history",)
            return result
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error Assigning Course. {str(e)}")
    
    async def process_course_csv(self, file_path: str, task_id: str):
        try:
            df = pd.read_csv(file_path)
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
                    course = Course(**raw)
                    await self.add_course_to_db(course)
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
