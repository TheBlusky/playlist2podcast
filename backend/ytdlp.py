from settings import DATA_DIR
import yt_dlp
import time
import uuid
import os


class YTDLPHandler:
    def __init__(self, podcast):
        self.podcast = podcast

    def download(self, element):
        podcast_index = self.podcast.data["index"]
        self.podcast.logger.info(
            f"YTDLPHandler download - Start {podcast_index}/{element['index']}"
        )
        archive = DATA_DIR / "archives" / f"{podcast_index}.archive.txt"
        log_file = (
            DATA_DIR
            / "logs"
            / podcast_index
            / f"{time.time()}.{element['index']}.ytd_dlp.log"
        )
        for f in (archive, log_file):
            os.makedirs(f.parent, exist_ok=True)
            f.touch()
        output_dir = DATA_DIR / "files" / podcast_index
        self.podcast.logger.info("YTDLPHandler download - Instanciating YoutubeDL")
        youtube_dl = yt_dlp.YoutubeDL(
            {
                "format": "mp3/bestaudio/best",
                "download_archive": str(archive),
                "writeinfojson": True,
                "allow_playlist_files": False,
                "outtmpl": str(
                    output_dir / f"{int(time.time())}-{uuid.uuid4()}-%(id)s"
                ),
                "postprocessors": [
                    {
                        "key": "FFmpegExtractAudio",
                        "preferredcodec": "mp3",
                    }
                ],
            }
        )

        self.podcast.logger.info("YTDLPHandler download - Downloading")

        with open(log_file, "w") as f:
            youtube_dl._out_files.out = f
            youtube_dl._out_files.error = f
            youtube_dl._out_files.screen = f
            youtube_dl._out_files.console = f
            youtube_dl.download(element["url"])
        self.podcast.logger.info("YTDLPHandler download - Download finished")

        self.podcast.logger.info("YTDLPHandler download - Finished")
