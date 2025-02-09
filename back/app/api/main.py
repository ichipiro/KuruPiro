from fastapi import APIRouter
from api.routes import importer
from api.routes import next_buses

api_router = APIRouter()
api_router.include_router(importer.router)
api_router.include_router(next_buses.router)
