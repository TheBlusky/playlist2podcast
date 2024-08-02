import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import Podcast from "./podcast";
import {useContext} from "react";
import {AppContext} from "../appcontext";

export default function Podcasts({reloadPodcasts}) {
  const { context } = useContext(AppContext)
  const { podcasts } = context
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Podcast</TableCell>
            <TableCell align="center">Last refresh</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="center">Elements</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {podcasts.map(p => <Podcast reloadPodcasts={reloadPodcasts} key={p.index} podcast={p} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
