import { useState } from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  Divider,
  TablePagination,
} from "@mui/material";
import { Newspaper } from "@mui/icons-material";
import { Newsitem } from "./Home";
import { format } from "date-fns";
import styles from "../../styles/general.module.scss";

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

  return (
    <>
      <List className={styles.list} dense>
        {rowSelection().map((newsitem, i) => (
          <div key={newsitem.id}>
            {i > 0 && <Divider />}
            <ListItem disablePadding>
              <ListItemButton onClick={() => onEdit(newsitem)}>
                <ListItemIcon>
                  <Newspaper />
                </ListItemIcon>
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
