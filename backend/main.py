import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request

from db import Podcast
from settings import DATA_DIR, SECRET
from utils import FilteredStaticFiles, ensure_dirs_exists
from views import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    background_task = asyncio.create_task(Podcast.background_coro())
    yield
    background_task.cancel()


ensure_dirs_exists()

app_api = FastAPI()
app_api.include_router(router)

app = FastAPI(lifespan=lifespan)
app.mount("/api/", app_api)
app.mount(
    "/files/",
    FilteredStaticFiles(directory=DATA_DIR / "files", filter=[".mp3", ".jpg"]),
    name="files",
)
app.mount(
    "/rss/",
    FilteredStaticFiles(directory=DATA_DIR / "rss", filter=[".xml"]),
    name="rss",
)
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="static")


@app_api.middleware("http")
async def secret_protected(request: Request, call_next):
    if SECRET:
        sent_cred = request.headers.get("x-api-password", "")
        if SECRET != sent_cred:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"details": "Not authenticated"},
            )
    response = await call_next(request)
    return response
