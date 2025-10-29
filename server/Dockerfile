FROM python:3.11-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
  gcc build-essential \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --upgrade pip && \
  pip install --prefix=/install --no-cache-dir -r requirements.txt

FROM python:3.11-slim

WORKDIR /app

COPY --from=builder /install /usr/local

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && gunicorn --bind 0.0.0.0:8000 macrodash.wsgi:application"]
