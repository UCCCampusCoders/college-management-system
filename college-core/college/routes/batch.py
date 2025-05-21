import os
import uuid
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status

from college.background_tasks.tasks import process_batch_csv
from college.db.database import DatabaseConnection, get_db
from college.models.batch import Batch
from college.services.batch_services import BatchMgr
from college.utils.utilities import PROGRESS_TRACKER


router = APIRouter()


async def get_batch_mgr(db: DatabaseConnection = Depends(get_db)) -> BatchMgr:
    await db.connect()
    return BatchMgr(db)


@router.post("/create/")
async def create_batch(batch: Batch, batch_mgr: BatchMgr = Depends(get_batch_mgr)):
    try:
        result = await batch_mgr.create_batch_in_db(batch)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create batch in the db",
            )
        return {"message": "Batch Created Successfully"}
    except Exception as e:
        raise (e)


@router.get("/")
async def get_batches(batch_mgr: BatchMgr = Depends(get_batch_mgr)):
    try:
        batch_data = await batch_mgr.get_all_batches()
        return batch_data
    except Exception as e:
        raise (e)


@router.delete("/{batch_id}/")
async def delete_batch(batch_id: str, batch_mgr: BatchMgr = Depends(get_batch_mgr)):
    try:
        result = await batch_mgr.delete_batch_from_db(batch_id)
        if result == 0:
            raise HTTPException(
                status_code=404, detail=f"Batch not found")
        return {"message": "Batch deleted Successfully"}
    except Exception as e:
        raise e


@router.post("/upload/")
async def upload_batches(background_tasks: BackgroundTasks, file: UploadFile = File(...),):
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

    background_tasks.add_task(process_batch_csv, file_path, file_id)
    return {"message": "File is saved for processing"}


@router.patch("/{batch_id}/")
async def update_batch(batch_id: str, batch: Batch, batch_mgr: BatchMgr = Depends(get_batch_mgr)):
    try:
        result = await batch_mgr.update_batch_in_db(batch_id, batch)
        if result == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found",
            )
        return {"message": "Course Updated Successfully"}
    except Exception as e:
        raise (e)
