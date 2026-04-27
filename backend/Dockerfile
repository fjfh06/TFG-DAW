FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (if needed for mysqlclient or others)
RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

# Use Gunicorn for production, or python app.py for dev
CMD ["python", "app.py"]
