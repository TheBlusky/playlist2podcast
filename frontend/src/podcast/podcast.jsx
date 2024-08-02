import {Button, Stack, TableCell, TableRow} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import NewElement from "../element/newelement.jsx";
import Elements from "../element/elements.jsx";
import { formatDistance } from 'date-fns'
import FeedLinkDialog from "./feedlink.jsx";
import {useContext} from "react";
import {AppContext} from "../appcontext.jsx";
export default function Podcast({podcast, reloadPodcasts}) {
  const { context } = useContext(AppContext)
  const deletePodcast = async () => {
    await fetch(`/api/podcasts/${podcast.index}/`, {
      method: "DELETE",
      headers: {
        "X-API-PASSWORD": context.secret,
      },
    })
    await reloadPodcasts()
  }
  const fetchPodcast = async () => {
    await fetch(`/api/podcasts/${podcast.index}/fetch/`, {
      method: "POST",
      headers: {
        "X-API-PASSWORD": context.secret,
      },
    })
    await reloadPodcasts()
  }
  return (
      <TableRow
        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
      >
        <TableCell component="th" scope="row">
          {podcast.title}
        </TableCell>
        <TableCell align="right">
          {
            podcast.last_fetch &&
            formatDistance(
              new Date(podcast.last_fetch*1000),
              new Date(),
              { addSuffix: true }
            )
          }
        </TableCell>
        <TableCell align="right">{podcast.status}</TableCell>
        <TableCell align="right">
          <Elements reloadPodcasts={reloadPodcasts} podcast={podcast} />
          <NewElement podcast={podcast} reloadPodcasts={reloadPodcasts} />
        </TableCell>
        <TableCell align="center">
          <Stack direction="row" spacing={2}>
            <FeedLinkDialog podcast={podcast} />
            <Button variant="outlined" onClick={fetchPodcast} endIcon={<RefreshIcon />}>
              Refresh
            </Button>
            <Button variant="outlined" onClick={deletePodcast} startIcon={<DeleteIcon />}>
              Delete
            </Button>
          </Stack>
        </TableCell>
      </TableRow>
  );
}
