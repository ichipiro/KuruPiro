#!/bin/sh

# マイグレーションの実行
alembic upgrade head

# アプリケーションの起動
echo "Starting uvicorn..."
exec uvicorn main:app --host 0.0.0.0 --port 8080
