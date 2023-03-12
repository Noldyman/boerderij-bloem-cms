import { ChangeEvent, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../services/notifications";
import { db } from "../../app/firebase";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Button, Dialog, TextField, Typography } from "@mui/material";
import { MarkdownEditor } from "../../components/common/MarkdownEditor";
import { Newsitem } from "./Home";
import { format } from "date-fns";
import styles from "../../styles/general.module.scss";
import { validateNewsitem } from "../../validation/validateNewsitem";

interface ErrorObj {
  title?: string;
  date?: string;
  message?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  newsitem?: Newsitem;
  onEdited: () => void;
}

const initialInput = { title: "", date: format(new Date(), "yyy-MM-dd") };

export const NewsitemDialog = ({ open, onClose, newsitem, onEdited }: Props) => {
  const setNotification = useSetRecoilState(notificationState);
  const [input, setInput] = useState(initialInput);
  const [markdownInput, setMarkdownInput] = useState("");
  const [errors, setErrors] = useState<ErrorObj | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getInitialInput = () => {
      if (newsitem) {
        setInput({
          title: newsitem.title,
          date: format(newsitem.date.toDate(), "yyyy-MM-dd"),
        });
        setMarkdownInput(newsitem.message);
      }
    };
    getInitialInput();
  }, [newsitem]);

  const handleClose = () => {
    setInput(initialInput);
    setMarkdownInput("");
    setErrors(undefined);
    onClose();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput((prevValue) => ({ ...prevValue, [e.target.name]: e.target.value }));
  };

  const handleMarkdownInputChange = (input?: string) => {
    setMarkdownInput(input ? input : "");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "newsitems/" + id));
      setNotification({ message: "Het nieuwsitem is verwijderd", severity: "success" });
      setInput(initialInput);
      setMarkdownInput("");
      onEdited();
      onClose();
    } catch (error) {
      console.log(error);
      setNotification({
        message: "Het is niet gelukt om het nieuwsitem te verwijderen",
        severity: "error",
      });
    }
  };

  const handleUpdate = async (id: string) => {
    setLoading(true);
    setErrors(undefined);
    const errors = await validateNewsitem({
      title: input.title,
      date: new Date(input.date),
      message: markdownInput,
    });

    if (errors) {
      setLoading(false);
      return setErrors(errors);
    }

    try {
      await updateDoc(doc(db, "newsitems/" + id), {
        title: input.title,
        date: new Date(input.date),
        message: markdownInput,
      });
      setNotification({ message: "Het nieuwsitem is aangepast", severity: "success" });
      setInput(initialInput);
      setMarkdownInput("");
      onEdited();
      onClose();
    } catch (error) {
      console.log(error);
      setNotification({
        message: "Het is niet gelukt om het nieuwsitem aan te passen",
        severity: "error",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors(undefined);
    const errors = await validateNewsitem({
      title: input.title,
      date: new Date(input.date),
      message: markdownInput,
    });

    if (errors) {
      setLoading(false);
      return setErrors(errors);
    }

    try {
      await addDoc(collection(db, "newsitems"), {
        title: input.title,
        date: new Date(input.date),
        message: markdownInput,
      });
      setNotification({ message: "Het nieuwsitem is toegevoegd", severity: "success" });
      setInput(initialInput);
      setMarkdownInput("");
      onEdited();
      onClose();
    } catch (error) {
      console.log(error);
      setNotification({
        message: "Het is niet gelukt om het nieuwsitem toe te voegen",
        severity: "error",
      });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <div className={styles.inputDialog}>
        <Typography variant="h5">Nieuwsitem {newsitem ? "aanpassen" : "plaatsen"}</Typography>
        <TextField
          inputProps={{ maxLength: 50 }}
          fullWidth
          size="small"
          label="Titel"
          name="title"
          placeholder="Titel"
          value={input.title}
          onChange={handleInputChange}
          error={Boolean(errors?.title)}
          helperText={errors?.title}
        />
        <TextField
          fullWidth
          size="small"
          type="date"
          name="date"
          label="Datum"
          InputLabelProps={{ shrink: true }}
          value={input.date}
          error={Boolean(errors?.date)}
          helperText={errors?.date}
          onChange={handleInputChange}
        />
        <MarkdownEditor value={markdownInput} onChange={handleMarkdownInputChange} />
        {errors?.message && <Typography color="error">{errors.message}</Typography>}
        <div className={styles.dialogActions}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          {newsitem ? (
            <>
              <Button color="error" onClick={() => handleDelete(newsitem.id)} variant="outlined">
                Verwijderen
              </Button>
              <Button
                disabled={loading}
                onClick={() => handleUpdate(newsitem.id)}
                variant="contained"
              >
                Aanpassen
              </Button>
            </>
          ) : (
            <Button disabled={loading} onClick={handleSubmit} variant="contained">
              Plaatsen
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
};
