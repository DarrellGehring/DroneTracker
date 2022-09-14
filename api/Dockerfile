FROM python:3.9

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/api

COPY ./* .

RUN pip install -r /app/api/requirements.txt

ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=8000
ENV FLASK_DEBUG=true


EXPOSE 8000
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=8000"]
