# Playlist2Podcast

## Roadmap

### Done

- [x] CRUD of playlists
- [x] Auto download, convert to mp3
- [x] Generate RSS Feed
- [x] Periodic auto scan
- [x] Authenticated API

### Todo

- [ ] Viewable logs, in browser
- [ ] Custom refresh period
- [ ] Custom yt-dlp params per feed

## Dev

1. `git clone https://github.com/TheBlusky/playlist2podcast`
2. Backend
   1. `cd backend`
   2. `pip install -r requirements.txt`
   3. `python -m uvicorn main:app"`
3. Frontend
   1. `cd frontend`
   2. `npm install`
   3. `npm run dev` or `npm run build`

Dev env can be either accessed by the:
- Backend, using `http://127.0.0.1:8000`, however, the frontend must have been built before.
- Frontend, using `http://127.0.0.1:5173`, however, backend must be launched and will be reverse proxified.

## Build and run

1. `git clone https://github.com/TheBlusky/playlist2podcast`
2. `docker build -t theblusky/playlist2podcast .`
3. `docker run --rm -it -p 8000:8000 theblusky/playlist2podcast`
4. `http://127.0.0.1:8000`

Never expose it to the Internet, run it at your own risk.

## Settings

Available environment variables  :

| Variable       | Default                           | Description                                                                                                    |
|----------------|-----------------------------------|----------------------------------------------------------------------------------------------------------------|
| `P2P_DATA_DIR` | `../data` (or `/data/` in Docker) | Location of all the data, including medias                                                                     |
| `P2P_HOSTNAME` | `http://127.0.0.1:8000`           | Hostname of the service. Must be set in order to work correctly                                                |
| `P2P_SECRET`   | Undefined                         | If set, this secret will be ask in order to use the webapp / API. Medias won't be secured through this secret. |