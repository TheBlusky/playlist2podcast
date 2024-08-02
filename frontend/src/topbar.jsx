import {AppBar, Button, Container, Toolbar, Typography} from "@mui/material";
import TopAIcon from '@mui/icons-material/Subscriptions';
import TopBIcon from '@mui/icons-material/Podcasts';
import {useContext} from "react";
import {formatDistance} from "date-fns";
import {AppContext} from "./appcontext.jsx";

export default function Topbar({reloadStatus}) {
  const { context } = useContext(AppContext)
  const { status } = context
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <TopAIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}>
            2
          </Typography>
          <TopBIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1,
            }}>
            - Playlist 2 Podcast
          </Typography>
          { status && (
            <Button color="inherit" onClick={async () => (await reloadStatus())}>
              Background service status: {status && status.podcasts_background_coro.wait_status}
              {
                (status.podcasts_background_coro.wait_status === "WAITING")
                  ? " (" + formatDistance(
                      new Date(status.podcasts_background_coro.wait_until*1000),
                      new Date(),
                      { addSuffix: true }
                    )  + ")"
                  : ""
              }
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
