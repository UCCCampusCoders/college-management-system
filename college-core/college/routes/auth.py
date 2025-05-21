from fastapi import APIRouter, Depends, HTTPException

from college.db.database import DatabaseConnection, get_db
from college.models.auth import UserLogin
from college.services.user_services import UserMgr


router = APIRouter()


async def get_user_mgr(db: DatabaseConnection = Depends(get_db)) -> UserMgr:
    await db.connect()
    return UserMgr(db)


@router.post("/login/")
async def login(form_data: UserLogin, user_mgr: UserMgr = Depends(get_user_mgr)):

    try:
        token, role, status = await user_mgr.verify_user_login(form_data)
        if status == "Inactive":
            return {"status": status, "message": "Password need to be changed to continue!!"}

        if not token:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return {"access_token": token, "token_type": "bearer", "role": role, "message": "Login Successful"}

    except Exception as e:
        raise (e)


@router.post("/change-password/")
async def change_password(form_data: UserLogin, user_mgr: UserMgr = Depends(get_user_mgr)):
    try:
        result = await user_mgr.change_password(form_data.password, form_data.email)
        if not result:
            raise HTTPException(
                status_code=401, detail="Password change failed")
        return {"message": "Password changed successfully"}
    except Exception as e:
        raise (e)