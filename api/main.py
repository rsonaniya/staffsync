from fastapi import FastAPI

from db import models
from db.database import engine
from routes import user_router
from auth import authentication

app = FastAPI()

app.include_router(user_router.router)
app.include_router(authentication.router)


@app.get("/health-check")
def get_health_status():
    return {"message": "StafSync is running"}


models.Base.metadata.create_all(engine)
