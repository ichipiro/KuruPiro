FROM python:3.11-bullseye

WORKDIR /app

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY ./app/ .

COPY startup.sh /startup.sh
RUN chmod 744 /startup.sh
CMD ["/startup.sh"]