from fastapi import APIRouter, Depends, HTTPException, status

from college.db.database import DatabaseConnection, get_db
from college.models.user import User
from college.services.user_services import UserMgr


router = APIRouter()


async def get_user_mgr(db: DatabaseConnection = Depends(get_db)) -> UserMgr:
    await db.connect()
    return UserMgr(db)


@router.post("/create")
async def create_user(user: User, user_mgr: UserMgr = Depends(get_user_mgr)):
    try:
        result = await user_mgr.add_user_to_db(user)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to insert usert into the database",
            )
        return {"message": "User Added Successfully"}
    except Exception as e:
        raise (e)


@router.get("/")
async def get_users(user_mgr: UserMgr = Depends(get_user_mgr)):
    try:
        user_data = await user_mgr.get_all_users()
        return user_data
    except Exception as e:
        raise e