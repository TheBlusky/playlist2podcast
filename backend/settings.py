import os
from pathlib import Path

DATA_DIR = os.environ.get("P2P_DATA_DIR", Path("../data"))
HOSTNAME = os.environ.get("P2P_HOSTNAME", "http://127.0.0.1:8000")
SECRET = os.environ.get("P2P_SECRET", False)
