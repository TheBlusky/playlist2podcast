import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import Topbar from "./topbar";
import Podcasts from "./podcast/podcasts";
import {Box, Button, FormControl, TextField} from "@mui/material";
import NewPodcast from "./podcast/newpodcast";
import {AppContext} from "./appcontext";
import {useContext, useEffect, useState} from "react";

export default function Home() {
  const { context, setContext } = useContext(AppContext)
  const [needAuth, setNeedAuth] = useState(false)
  const reloadPodcasts = async () => {
    await reload({rpodcasts:true})
  }
  const reloadStatus = async () => {
    await reload({rstatus:true})
  }
  const reload = async ({rstatus, rpodcasts}) => {
    let status = {}
    let  podcasts = {}
    if(rstatus) {
      const response = await fetch("/api/status/", {headers:{"X-API-PASSWORD": context.secret}})
      if (response.status === 403) { setNeedAuth(true); return}
      setNeedAuth(false)
      if (!response.ok) throw new Error()
      status = {status: await response.json()}
    }
    if (rpodcasts) {
      const response = await fetch("/api/podcasts/", {headers:{"X-API-PASSWORD": context.secret}})
      if (!response.ok) throw new Error()
      podcasts = {podcasts: (await response.json()).podcasts}
    }
    setContext({...context, ...status, ...podcasts})
  }
  const initLoad = async () => {
    try {
      await reload({rstatus:true, rpodcasts:true})
    } catch {
      console.log("Failed to init load")
    }
  }
  useEffect(() => {
    initLoad()
  }, []);
  return (
      <>
        <CssBaseline />
        <Topbar reloadStatus={reloadStatus} />
              <Box component="section" sx={{ p: 5 }}>
        {
          context.status
          && (
            <>
                <NewPodcast reloadPodcasts={reloadPodcasts}/>
                <Podcasts reloadPodcasts={reloadPodcasts} />
            </>
          )
        }
        {
          needAuth
          && (
            <>
              <FormControl>
                <TextField
                  label="Playlist 2 Podcast Secret"
                  id="secret-input"
                  variant="outlined"
                  type="password"
                  onKeyUp={async (e) => ((e.key === 'Enter') && (await initLoad()))}
                  value={context.secret || ""}
                  onChange={(event) => {
                    setContext({...context, secret: event.target.value});
                  }} />
                <Button variant="contained" onClick={initLoad}>Connect</Button>
              </FormControl>
            </>
          )
        }
              </Box>
      </>
  );
}
