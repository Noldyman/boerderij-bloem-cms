import { useState } from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  TablePagination,
  ListItemAvatar,
  Avatar,
  Typography,
} from "@mui/material";
import { Newspaper } from "@mui/icons-material";

import { format } from "date-fns";
import { Newsitem } from "../../models/news";

interface Props {
  newsitems: Newsitem[];
  onEdit: (newsitem: Newsitem) => void;
}

export const NewsitemList = ({ newsitems, onEdit }: Props) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const rowSelection = () => {
    const startPos = page * rowsPerPage;
    const endPos = startPos + rowsPerPage;

    return newsitems.filter((_, i) => i >= startPos && i < endPos);
  };

  if (newsitems.length === 0)
    return <Typography fontStyle="italic">Er zijn nog geen nieuwsitems</Typography>;

  return (
    <>
      <List className="list" dense>
        {rowSelection().map((newsitem, i) => (
          <div key={newsitem.id}>
            {i > 0 && <Divider />}
            <ListItem disablePadding>
              <ListItemButton onClick={() => onEdit(newsitem)}>
                <ListItemAvatar>
                  {newsitem.imageUrl ? (
                    <Avatar alt="img" src={newsitem.imageUrl} />
                  ) : (
                    <Avatar>
                      <Newspaper />
                    </Avatar>
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={newsitem.title}
                  secondary={format(newsitem.date.toDate(), "dd-MM-yyyy")}
                />
              </ListItemButton>
            </ListItem>
          </div>
        ))}
      </List>
      <TablePagination
        component="div"
        count={newsitems.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        labelRowsPerPage="Rijen"
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 15, 20]}
      />
    </>
  );
};
