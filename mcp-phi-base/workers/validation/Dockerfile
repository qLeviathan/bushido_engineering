FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgmp-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy worker script
COPY validation_worker.py .

# Create non-root user
RUN useradd -m -u 1000 phi && chown -R phi:phi /app
USER phi

# Environment for worker type
ENV WORKER_TYPE=""

# Run worker
CMD ["sh", "-c", "python validation_worker.py ${WORKER_TYPE}"]