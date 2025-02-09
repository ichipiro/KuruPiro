from fastapi import APIRouter, HTTPException

from importer import import_all_gtfs_static_data


router = APIRouter()


@router.post("/importer")
def trigger_import():
    try:
        import_all_gtfs_static_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"インポートに失敗しました: {e}")
    return {"message": "GTFS staticデータのインポートが完了しました。"}
