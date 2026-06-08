from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler


from db import models
from db.database import engine
from jobs.attendance_cron import run_nightly_attendance_reconciliation
from routes import (
    leave_type_router,
    user_router,
    leave_policy_router,
    leave_policy_rule_router,
    user_shift_router,
    locations_router,
    holiday_router,
    attendance_router,
)
from auth import authentication
from contextlib import asynccontextmanager

from utils.cloudinary_client import init_cloudinary


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_cloudinary()
    print("cloudinary SDK Initialized")

    scheduler = BackgroundScheduler()
    scheduler.add_job(run_nightly_attendance_reconciliation, "cron", minute=50)
    scheduler.start()
    print("background scheduler started")
    yield
    scheduler.shutdown()
    print("Background Scheduler Shutdown")


app = FastAPI(lifespan=lifespan)

app.include_router(authentication.router)
app.include_router(user_router.router)
app.include_router(leave_type_router.router)
app.include_router(leave_policy_router.router)
app.include_router(leave_policy_rule_router.router)
app.include_router(user_shift_router.router)
app.include_router(locations_router.router)
app.include_router(holiday_router.router)
app.include_router(attendance_router.router)


@app.api_route("/health-check", methods=["GET", "HEAD"])
def get_health_status():
    return {"message": "StafSync is running"}


models.Base.metadata.create_all(engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
