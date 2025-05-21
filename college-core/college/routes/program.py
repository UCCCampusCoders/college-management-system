import os
from typing import Literal
import uuid
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Query, UploadFile, status

from college.background_tasks.tasks import process_program_csv
from college.db.database import DatabaseConnection, get_db
from college.models.program import Program
from college.services.program_services import ProgramMgr
from college.utils.utilities import PROGRESS_TRACKER


router = APIRouter()


async def get_program_mgr(db: DatabaseConnection = Depends(get_db)) -> ProgramMgr:
    await db.connect()
    return ProgramMgr(db)


@router.post("/create/")
async def create_program(program: Program, program_mgr: ProgramMgr = Depends(get_program_mgr)):
    try:
        result = await program_mgr.add_program_to_db(program)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to insert program into the database",
            )
        return {"message": "Program Added Successfully"}
    except Exception as e:
        raise (e)


@router.patch("/{program_id}/")
async def update_program(program_id: str, program: Program, program_mgr: ProgramMgr = Depends(get_program_mgr)):
    try:
        result = await program_mgr.update_program_in_db(program_id, program)
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Program not found",
            )
        return {"message": "Program Updated Successfully"}
    except Exception as e:
        raise (e)


@router.get("/")
async def get_programs(program_mgr: ProgramMgr = Depends(get_program_mgr)):
    try:
        program_data = await program_mgr.get_all_programs()
        return program_data
    except Exception as e:
        raise (e)


@router.get("/status/")
async def get_programs_by_status(program_status: Literal["Active", "Inactive", "Deleted"] = Query(...), program_mgr: ProgramMgr = Depends(get_program_mgr)):
    try:
        program_data = await program_mgr.get_programs_by_status(program_status)
        return program_data
    except Exception as e:
        raise (e)


@router.delete("/{program_id}/")
async def delete_program(program_id: str, program_mgr: ProgramMgr = Depends(get_program_mgr)):
    try:
        result = await program_mgr.delete_program_in_db(program_id)
        if result == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Program not found",
            )
        return {"message": "Program Deleted Successfully"}
    except Exception as e:
        raise (e)


@router.post("/upload/")
async def upload_programs(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
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

    background_tasks.add_task(process_program_csv, file_path, file_id)
    return {"message": "File is saved for processing"}