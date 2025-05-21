from college.db.database import get_db
from college.services.batch_services import BatchMgr
from college.core.logging_config import app_logger
from college.services.course_services import CourseMgr
from college.services.faculty_services import FacultyMgr
from college.services.program_services import ProgramMgr
from college.services.student_services import StudentMgr


async def process_batch_csv(file_path: str, file_id: str):
    db = get_db()
    await db.connect()
    batch_mgr = BatchMgr(db)
    app_logger.info(f'Background Process: Processing Batch csv file')
    await batch_mgr.process_batch_csv(file_path, file_id)
    app_logger.info(f'Background Process: Processing Batch csv file completed')
    

async def process_program_csv(file_path: str, file_id: str):
    db = get_db()
    await db.connect()
    program_mgr = ProgramMgr(db)
    app_logger.info(f'Background Process: Processing Program csv file')
    await program_mgr.process_program_csv(file_path, file_id)
    app_logger.info(f'Background Process: Processing Program csv file completed')

async def process_faculty_csv(file_path: str, file_id: str):
    db = get_db()
    await db.connect()
    faculty_mgr = FacultyMgr(db)
    app_logger.info(f'Background Process: Processing Faculty csv file')
    await faculty_mgr.process_faculty_csv(file_path, file_id)
    app_logger.info(f'Background Process: Processing Faculty csv file completed')

async def process_course_csv(file_path: str, file_id: str):
    db = get_db()
    await db.connect()
    course_mgr = CourseMgr(db)
    app_logger.info(f'Background Process: Processing Course csv file')
    await course_mgr.process_course_csv(file_path, file_id)
    app_logger.info(f'Background Process: Processing Course csv file completed')
    
async def process_student_csv(file_path: str, file_id: str):
    db = get_db()
    await db.connect()
    student_mgr = StudentMgr(db)
    app_logger.info(f'Background Process: Processing Student csv file')
    await student_mgr.process_student_csv(file_path, file_id)
    app_logger.info(f'Background Process: Processing Student csv file completed')