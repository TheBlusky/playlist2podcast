# Build frontend
FROM node:22.5
RUN mkdir /app
WORKDIR /app
COPY ./frontend ./frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build


# Build backend
FROM python:3.12
RUN apt-get update && apt-get install ffmpeg -y
RUN mkdir /app
WORKDIR /app
COPY ./backend/ ./backend/
WORKDIR /app/backend
RUN pip install -r requirements.txt

# Finalize image
COPY --from=0 /app/frontend/dist /app/frontend/dist
CMD ["python", "-m", "uvicorn", "--host", "0.0.0.0", "--port", "8000", "main:app"]
VOLUME /data/
EXPOSE 8000