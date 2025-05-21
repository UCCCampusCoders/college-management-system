import os
import uuid
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status

from college.background_tasks.tasks import process_faculty_csv
from college.db.database import DatabaseConnection, get_db
from college.models.faculty import Faculty, FacultyUpdate
from college.services.faculty_services import FacultyMgr
from college.utils.utilities import PROGRESS_TRACKER


router = APIRouter()


async def get_faculty_mgr(db: DatabaseConnection = Depends(get_db)) -> FacultyMgr:
    await db.connect()
    return FacultyMgr(db)


@router.get("/")
async def get_faculties(faculty_mgr: FacultyMgr = Depends(get_faculty_mgr)):
    try:
        faculty_data = await faculty_mgr.get_all_faculties()
        return faculty_data
    except Exception as e:
        raise (e)


@router.post("/create/")
async def create_faculty(faculty: Faculty, faculty_mgr: FacultyMgr = Depends(get_faculty_mgr)):
    try:
        result = await faculty_mgr.add_faculty_to_db(faculty)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to insert faculty into the database",
            )
        return {"message": "Faculty Added Successfully"}
    except Exception as e:
        raise (e)


@router.post("/upload/")
async def upload_faculties(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename or not file.filename.endswith((".csv", ".xlsx")):
        raise HTTPException(
            status_code=400, detail="Only CSV or Excel files are supported"
        )

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOADS_DIR = os.path.join(BASE_DIR, "..", "uploads")
    UPLOADS_DIR = os.path.abspath(UPLOADS_DIR)

    os.makedirs(UPLOADS_DIR, exist_ok=True)

    file_id = uuid.uuid4().hex
    filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(UPLOADS_DIR, filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    PROGRESS_TRACKER[file_id] = {
        "progress": 0,
        "status": "processing",
        "error_file": None,
        "total": 0,
        "processed": 0,
        "successfull": 0,
        "failed": 0
    }

    background_tasks.add_task(process_faculty_csv, file_path, file_id)
    return {"message": "File is saved for processing"}


@router.get("/{user_id}/")
async def get_faculty_by_user_id(user_id: str, faculty_mgr: FacultyMgr = Depends(get_faculty_mgr)):
    try:
        faculty_data = await faculty_mgr.get_faculty_by_user_id(user_id)
        return faculty_data
    except Exception as e:
        raise (e)

@router.patch("/{faculty_id}/")
async def update_faculty(faculty_id: str, faculty: FacultyUpdate, faculty_mgr: FacultyMgr = Depends(get_faculty_mgr)):
    try:
        result = await faculty_mgr.update_faculty_by_id(faculty_id, faculty)
        if result == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Faculty not found",
            )
        return {"message": "Faculty Updated Successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating Faculty: {str(e)}"
        )