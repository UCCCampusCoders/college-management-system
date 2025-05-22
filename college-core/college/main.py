from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Response
from college.db.database import get_db
from college.routes import auth, batch, course, faculty, program, student, user
from college.utils.request_logging_middleware import RequestLoggingMiddleware
from college.core.logging_config import app_logger

db = get_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    app_logger.info("FastAPI app started")
    await db.connect()
    app_logger.info("App Startup Complete")
    yield
    await db.close()
    app_logger.info("FastAPI app stopped")

app = FastAPI(
    lifespan=lifespan
)


@app.options("/{path:path}")
async def options_handler(path_str):
    return Response()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

app.include_router(program.router, prefix="/program", tags=["Program"])
app.include_router(course.router, prefix="/course", tags=["Course"])
app.include_router(student.router, prefix="/student", tags=["Student"])
app.include_router(faculty.router, prefix="/faculty", tags=["Faculty"])
app.include_router(batch.router, prefix="/batch", tags=["Batch"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

@app.get("/")
async def root():
    return {"message": "Welcome to the College Management Backend"}