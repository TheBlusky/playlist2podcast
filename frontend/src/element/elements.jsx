import List from '@mui/material/List';
import Element from "./element.jsx";

export default function Elements({podcast, reloadPodcasts}) {
  return (
    <List dense>
      {podcast.elements && Object.keys(podcast.elements).map((index) => (
        <Element reloadPodcasts={reloadPodcasts} podcast={podcast} element={podcast.elements[index]} key={index} />
      ))}
    </List>
);
}
