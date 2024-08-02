import {
  IconButton,
  ListItem
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete.js";
import {useContext} from "react";
import {AppContext} from "../appcontext.jsx";

export default function Element({podcast, element, reloadPodcasts}) {
  const { context } = useContext(AppContext)
  const deleteElement = async () => {
    await fetch(`/api/podcasts/${podcast.index}/elements/${element.index}/`, {
      method: "DELETE",
      headers:{"X-API-PASSWORD": context.secret},
    })
    await reloadPodcasts()
  }
  return (
    <ListItem secondaryAction={
      <IconButton onClick={deleteElement} variant="contained" aria-label="add" color="primary">
        <DeleteIcon />
      </IconButton>}>
      {element.url}
    </ListItem>
);
}
