from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class PodcastCreate(BaseModel):
    title: str


class ElementCreate(BaseModel):
    url: str
