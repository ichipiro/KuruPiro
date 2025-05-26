import os
import sys


current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from api.routes import router


app = FastAPI()


allowed_origins_csv = os.getenv("ALLOWED_ORIGINS_CSV", "")
allowed_origins = [origin.strip() for origin in allowed_origins_csv.split(',') if origin.strip()]
if not allowed_origins:
    allowed_origins = ["http://localhost:5173"]

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def health_check():
    return {"status": "healthy"}
