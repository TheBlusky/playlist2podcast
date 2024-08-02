import {Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField} from "@mui/material";
import {useContext, useState} from "react";
import AddIcon from "@mui/icons-material/Add.js";
import {AppContext} from "../appcontext.jsx";

export default function NewElement({podcast, reloadPodcasts}) {
  const [open, setOpen] = useState(false);
  const { context } = useContext(AppContext)
  const handleClickOpen = () => {setOpen(true);};
  const handleClose = () => {setOpen(false)};
  return (
    <>
      <IconButton onClick={handleClickOpen} variant="contained" aria-label="add" color="primary">
        <AddIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            await fetch(`/api/podcasts/${podcast.index}/elements/`, {
              method: "POST",
              body: JSON.stringify({item: formJson}),
              headers: {
                "X-API-PASSWORD": context.secret,
                "Content-Type": "application/json",
              },
            })
            await reloadPodcasts();
            handleClose();
          },
        }}
      >
        <DialogTitle>Add an element (channel, playlist, video, ...)</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="url"
            name="url"
            label="url"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Add</Button>
        </DialogActions>
      </Dialog>
    </>
);
}
