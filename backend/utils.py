import os

from fastapi import HTTPException
from fastapi.staticfiles import StaticFiles

from settings import DATA_DIR


class FilteredStaticFiles(StaticFiles):
    def __init__(self, *args, **kwargs):
        self.filter = kwargs.pop("filter", [])
        super(FilteredStaticFiles, self).__init__(*args, **kwargs)

    def file_response(self, *args, **kwargs):
        full_path = args[0]
        if not any(str(full_path).endswith(f) for f in self.filter):
            raise HTTPException(status_code=404)
        return super(FilteredStaticFiles, self).file_response(*args, **kwargs)


def ensure_dirs_exists():
    for sub_path in ["archives", "files", "logs", "podcasts", "rss"]:
        os.makedirs(DATA_DIR / sub_path, exist_ok=True)
