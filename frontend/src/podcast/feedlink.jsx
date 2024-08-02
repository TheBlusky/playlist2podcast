import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useContext, useState} from "react";
import {AppContext} from "../appcontext.jsx";
import RssFeedIcon from "@mui/icons-material/RssFeed.js";
import {Snackbar} from "@mui/material";

export default function FeedLinkDialog({podcast}) {
  const [open, setOpen] = useState(false);
  const [snakeBarState, setSnakeBarState] = useState({open: false, message: ''});
  const { context } = useContext(AppContext)
  const podcastFeed = `${context.status && context.status.hostname}/rss/${podcast.index}.xml`
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const goTo = () => {
    window.open(podcastFeed, "_blank").focus()
  }
  const handleSnakeBarClose = (event,  reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnakeBarState({open: false, message: ''});
  }
  const clipBoard = async () => {
    try {
      const perm = await navigator.permissions.query({ name: "clipboard-write" })
      console.log(perm)
      if (perm.state !== 'granted') {
        throw new Error()
      }
      await navigator.clipboard.writeText(podcastFeed)
      setSnakeBarState({open: true, message: 'Link copied to clipboard'});
    } catch (e) {
      setSnakeBarState({open: true, message: 'Error trying to write to clipboard'});
      throw e
    }
  }
  return (
    <>
      <Button variant="outlined" onClick={handleClickOpen} endIcon={<RssFeedIcon />}>
        RSS Feed Link
      </Button>
      <Snackbar
        open={snakeBarState.open}
        autoHideDuration={3000}
        onClose={handleSnakeBarClose}
        message={snakeBarState.message}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {podcast.title} RSS feed link
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {podcastFeed}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={clipBoard}>
            Copy to clipboard
          </Button>
          <Button onClick={goTo}>
            Go to feed
          </Button>
          <Button onClick={handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}