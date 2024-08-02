import asyncio
import logging
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from rss import RSSHandler
from ytdlp import YTDLPHandler
from settings import DATA_DIR
import json
import uuid
import os

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
stream_handler = logging.StreamHandler(sys.stdout)
log_formatter = logging.Formatter(
    "%(asctime)s [%(processName)s: %(process)d] [%(threadName)s: %(thread)d] [%(levelname)s] %(name)s: %(message)s"
)
stream_handler.setFormatter(log_formatter)
logger.addHandler(stream_handler)


class PodcastDB:
    instance = None

    @classmethod
    def get_instance(cls):
        if cls.instance is None:
            cls.instance = PodcastDB()
        return cls.instance

    def __init__(self):
        self.podcasts = {
            (index := filename.removesuffix(".json")): Podcast.load(index)
            for filename in os.listdir(DATA_DIR / "podcasts")
        }

    def add(self, podcast):
        self.podcasts[podcast.data["index"]] = podcast

    def remove(self, podcast):
        del self.podcasts[podcast.data["index"]]


class Podcast:
    thread_pool = ThreadPoolExecutor(max_workers=2)
    background_coro_wait_until = None
    background_coro_wait_status = "NOT_STARTED"

    def __init__(self, **data):
        self.data = data
        self.lock = threading.Lock()
        logger = logging.getLogger(f"{__name__}/{self.data['index']}")
        handler = logging.FileHandler(DATA_DIR / "logs" / f"{self.data['index']}.log")
        formatter = logging.Formatter("%(asctime)s %(levelname)s %(message)s")
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        self.logger = logger

    @classmethod
    async def background_coro(cls):
        try:
            logger.info("Starting background coro")
            Podcast.background_coro_wait_until = time.time()
            while True:
                to_wait = max(int(Podcast.background_coro_wait_until - time.time()), 0)
                logger.info(f"Waiting {to_wait}s for next global fetching")
                Podcast.background_coro_wait_status = "WAITING"
                await asyncio.sleep(to_wait)
                logger.info(f"Fetching")
                Podcast.background_coro_wait_status = "FETCHING"
                for podcast in PodcastDB.get_instance().podcasts.values():
                    podcast.fetch_thread()
                Podcast.background_coro_wait_until += 3600
        except asyncio.CancelledError:
            logger.info("Finished background coro")
            Podcast.background_coro_wait_status = "FINISHED"
        except Exception:
            Podcast.background_coro_wait_status = "ERRORED"
            raise

    @classmethod
    def load(cls, index):
        filename = DATA_DIR / "podcasts" / f"{index}.json"
        with open(filename, "r") as f:
            data = json.load(f)
        return Podcast(**data)

    @classmethod
    def create(cls, title=None):
        index = str(uuid.uuid4())
        podcast = Podcast(index=index, title=title)
        podcast.save()
        PodcastDB.get_instance().add(podcast)
        return podcast

    def save(self):
        filename = DATA_DIR / "podcasts" / f"{self.data['index']}.json"
        with open(filename, "w") as outfile:
            json.dump(self.data, outfile)

    def remove(self):
        filename = DATA_DIR / "podcasts" / f"{self.data['index']}.json"
        os.remove(filename)
        PodcastDB.get_instance().remove(self)

    def update_status(self, status):
        self.update(status=status, last_fetch=int(time.time()))

    def update(self, **data):
        self.data = {**self.data, **data}
        self.save()

    def fetch(self):
        self.logger.info("fetch - Starting")
        self.update(last_fetch=int(time.time()))
        self.update_status("STARTING")
        lock_acquired = False
        try:
            self.lock.acquire(blocking=False)
            self.update_status(status="STARTED")
            lock_acquired = True
            yt_handler = YTDLPHandler(self)
            elements = list(self.get_elements().values())
            for element_i in range(len(elements)):
                element = elements[element_i]
                self.update_status(status=f"DL_{element_i}/{len(elements)}")
                yt_handler.download(element)
            rss_handler = RSSHandler(self)
            rss_handler.generate()
            self.logger.info("fetch - Finished")
            self.update_status("FINISHED")
        except Exception:
            import traceback

            traceback.print_exc()
            self.update_status(status="ERRORED")
            self.logger.info("fetch - Errored")
            raise
        finally:
            if lock_acquired:
                self.lock.release()
                self.logger.info("fetch - Lock released")

    def fetch_thread(self):
        logger.info(
            f"fetch_thread - {self.data['title']} / {self.data['index']} - Starting"
        )
        self.logger.info("fetch_thread - Starting")
        if self.lock.locked():
            self.logger.info("fetch_thread - Error, still locked")
        else:
            self.logger.info("fetch_thread - Creating thread")
            self.thread_pool.submit(self.fetch)
            self.logger.info("fetch_thread - Finished")

    def get_elements(self):
        return self.data.get("elements", {})

    def add_element(self, element_url):
        index = str(uuid.uuid4())
        new_element = {
            "index": index,
            "url": element_url,
        }
        self.update(
            elements={
                **self.get_elements(),
                index: new_element,
            }
        )

    def del_element(self, element):
        self.update(
            elements={
                c_index: c_element
                for c_index, c_element in self.get_elements().items()
                if element["index"] != c_index
            }
        )
