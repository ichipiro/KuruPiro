FROM python:3.11.12-slim-bookworm

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY ./app/ /app/

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
