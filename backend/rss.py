import json
import os
import glob
from os.path import isfile
import requests
from PIL import Image
from feedgen.feed import FeedGenerator
from six import BytesIO

from settings import DATA_DIR, HOSTNAME


class RSSHandler:
    def __init__(self, podcast):
        self.podcast = podcast

    def generate(self):
        podcast_index = self.podcast.data["index"]
        filename = DATA_DIR / "rss" / f"{podcast_index}.xml"
        os.makedirs(filename.parent, exist_ok=True)
        fg = FeedGenerator()
        fg.load_extension("podcast")

        fg.id(self.podcast.data["index"])
        fg.title(self.podcast.data["title"])
        fg.description(self.podcast.data.get("description", self.podcast.data["index"]))
        fg.link(href=f"{HOSTNAME}/rss/{podcast_index}", rel="self")
        fg.link(href=HOSTNAME, rel="alternate")
        fg.language("en")

        mp3_files = glob.glob(f"{DATA_DIR}/files/{self.podcast.data['index']}/*.mp3")
        mp3_files.sort(reverse=True)
        for mp3_file in mp3_files:
            mp3_file = mp3_file.replace("\\", "/")
            elem_file_pre = mp3_file.removesuffix(".mp3")
            json_file = f"{elem_file_pre}.info.json"
            with open(json_file, "r", encoding="utf-8") as json_f:
                json_data = json.load(json_f)
            fe = fg.add_entry()
            fe.id(elem_file_pre.split("/")[-1])
            fe.title(json_data["title"])
            fe.description(json_data["description"])
            fe.link(href=json_data["webpage_url"], rel="alternate")
            if "thumbnail" in json_data:
                thumbnail_file = f"{elem_file_pre}.jpg"
                if not isfile(thumbnail_file):
                    if json_data["thumbnail"].endswith(".jpg"):
                        with requests.get(json_data["thumbnail"], stream=True) as r:
                            r.raise_for_status()
                            with open(thumbnail_file, "wb") as f:
                                for chunk in r.iter_content(chunk_size=8192):
                                    f.write(chunk)
                    elif json_data["thumbnail"].endswith(".webp"):
                        response = requests.get(json_data["thumbnail"])
                        response.raise_for_status()
                        webp = BytesIO(response.content)
                        image = Image.open(webp).convert("RGB")
                        image.save(thumbnail_file)
                fe.podcast.itunes_image(
                    f"{HOSTNAME}/files/{self.podcast.data['index']}/{thumbnail_file.split('/')[-1]}"
                )
            fe.enclosure(
                f"{HOSTNAME}/files/{self.podcast.data['index']}/{mp3_file.split('/')[-1]}",
                json_data.get("duration", 0),
                "audio/mpeg",
            )

        fg.rss_str(pretty=True)
        fg.rss_file(filename)
