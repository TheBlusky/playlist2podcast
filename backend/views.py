from fastapi import APIRouter, HTTPException, Body
from db import PodcastDB, Podcast
from serializers import PodcastCreate, ElementCreate
from typing import Annotated
from yt_dlp import version as yt_dlp_version
from settings import HOSTNAME

router = APIRouter()


@router.get("/status/")
async def status():
    return {
        "podcasts_background_coro": {
            "wait_until": Podcast.background_coro_wait_until,
            "wait_status": Podcast.background_coro_wait_status,
        },
        "yt_dlp": yt_dlp_version.__version__,
        "hostname": HOSTNAME,
    }


@router.get("/podcasts/")
async def postcasts_list():
    podcasts = PodcastDB.get_instance().podcasts
    return {"podcasts": [p.data for p in podcasts.values()]}


@router.post("/podcasts/")
async def postcasts_create(item: Annotated[PodcastCreate, Body(embed=True)]):
    podcast = Podcast.create(item.title)
    return {"podcast": podcast.data}


@router.delete("/podcasts/{podcast_id}/")
async def postcasts_delete(podcast_id):
    try:
        podcasts = PodcastDB.get_instance().podcasts
        podcast = podcasts[podcast_id]
        podcast.remove()
        return {"podcast": None}
    except KeyError:
        raise HTTPException(status_code=404)


@router.post("/podcasts/{podcast_id}/fetch/")
async def podcasts_fetch(podcast_id):
    try:
        podcasts = PodcastDB.get_instance().podcasts
        podcast = podcasts[podcast_id]
        podcast.fetch_thread()
        return {"status": "ok"}
    except KeyError:
        raise HTTPException(status_code=404)


@router.post("/podcasts/{podcast_id}/elements/")
async def elements_add(podcast_id, item: Annotated[ElementCreate, Body(embed=True)]):
    try:
        podcasts = PodcastDB.get_instance().podcasts
        podcast = podcasts[podcast_id]
        podcast.add_element(item.url)
        return {"podcast": podcast.data}
    except KeyError:
        raise HTTPException(status_code=404)


@router.delete("/podcasts/{podcast_id}/elements/{element_id}/")
async def elements_delete(podcast_id, element_id):
    try:
        podcasts = PodcastDB.get_instance().podcasts
        podcast = podcasts[podcast_id]
        element = podcast.get_elements()[element_id]
        podcast.del_element(element)
        return {"element": None}
    except KeyError:
        raise HTTPException(status_code=404)
