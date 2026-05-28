from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from db import models
from db.database import engine
from routes import (
    leave_type_router,
    user_router,
    leave_policy_router,
    leave_policy_rule_router,
    user_shift_router,
)
from auth import authentication
from contextlib import asynccontextmanager

from utils.cloudinary_client import init_cloudinary


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_cloudinary()
    print("cloudinary SDK Initialized")
    yield


app = FastAPI()

app.include_router(authentication.router)
app.include_router(user_router.router)
app.include_router(leave_type_router.router)
app.include_router(leave_policy_router.router)
app.include_router(leave_policy_rule_router.router)
app.include_router(user_shift_router.router)


@app.get("/health-check")
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
