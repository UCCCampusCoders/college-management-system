from datetime import datetime

from fastapi import HTTPException, status
from college.db.database import DatabaseConnection
from college.models.mappings import CourseAssignment
from college.services.faculty_services import FacultyMgr
from college.core.logging_config import app_logger


class MappingMgr:
    def __init__(self, db: DatabaseConnection):
        self.db = db
        self.course_assignment = self.db.get_collection_reference("course_assignment")
        self.course_assignment_history = self.db.get_collection_reference(
            "course_assignment_history")
        self._faculty_mgr = None

    @property
    def faculty_mgr(self):
        if self._faculty_mgr is None:
            self._faculty_mgr = FacultyMgr(self.db)
        return self._faculty_mgr
    
    async def add_course_assignment(self, assignment_data: CourseAssignment):
        try:
            data = assignment_data.model_dump(exclude_none=True)
            data["assigned_date"] = datetime.now()
            result = await self.course_assignment.insert_one(data)
            return result.inserted_id
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error: " + str(e))

    async def save_course_assignment(self, assignment_data: dict):
        try:
            result = await self.course_assignment_history.insert_one(assignment_data)
            return result.inserted_id
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error Saving course assignment in history, {str(e)}")
    
    async def get_course_assignments(self, course_id: str):
        try:
            assignments = await self.course_assignment.find(
                {"course_id": course_id}).to_list(length=None)
            if not assignments:
                return None

            for assignment in assignments:
                assignment["_id"] = str(assignment["_id"])
                faculty = None
                faculty = await self.faculty_mgr.get_faculty_by_user_id(assignment.get("faculty_id"))
                if faculty:
                    assignment["faculty"] = faculty
            return assignments
        except Exception as e:
            app_logger.error(str(e))
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                                detail=f"Error fetching courseAssignments, {str(e)}")