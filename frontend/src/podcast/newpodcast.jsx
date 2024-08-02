import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import {useContext, useState} from "react";
import {AppContext} from "../appcontext.jsx";

export default function NewPodcast({reloadPodcasts}) {
  const [open, setOpen] = useState(false);
  const { context } = useContext(AppContext)
  const handleClickOpen = () => {setOpen(true);};
  const handleClose = () => {setOpen(false)};
  return (
    <>
      <Button variant="outlined" onClick={handleClickOpen}>
        Create a podcast
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: 'form',
          onSubmit: async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            await fetch("/api/podcasts/", {
              method: "POST",
              body: JSON.stringify({item: formJson}),
              headers: {
                "Content-Type": "application/json",
                "X-API-PASSWORD": context.secret,
              },
            })
            await reloadPodcasts()
            handleClose();
          },
        }}
      >
        <DialogTitle>Create a podcast</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            id="title"
            name="title"
            label="title"
            type="text"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Create</Button>
        </DialogActions>
      </Dialog>
    </>
);
}
