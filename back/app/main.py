from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from api.main import api_router
from importer import import_all_gtfs_static_data

app = FastAPI(title="KuruPiro API", docs_url="/api/docs", redoc_url="/api/redoc")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://kurupiro.huyu2239.work"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "KuruPiro API is running."}


app.include_router(api_router, prefix="/api")
