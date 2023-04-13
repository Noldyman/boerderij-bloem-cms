import { ChangeEvent, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../services/notifications";
import {
  Avatar,
  Button,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { Delete, PhotoCamera } from "@mui/icons-material";
import { MarkdownEditor } from "../../components/common/MarkdownEditor";
import { validateNewsitem } from "../../validation/validateNewsitem";
import { format } from "date-fns";
import { CropImageDialog } from "../../components/CropImageDialog";
import { InputDialog } from "../../components/InputDialog";
import { NewImage } from "../../models/images";
import { Newsitem } from "../../models/news";
import { createNewsitem, deleteNewsItem, updateNewsItem } from "../../services/newsService";
import { deleteImage, updateImage } from "../../services/imageService";

interface ErrorObj {
  title?: string;
  date?: string;
  message?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  newsitem?: Newsitem;
  newsitemsWithImageIds: string[];
  onEdited: () => void;
}

const initialInput = { title: "", date: format(new Date(), "yyy-MM-dd") };

export const NewsitemDialog = ({
  open,
  onClose,
  newsitem,
  newsitemsWithImageIds,
  onEdited,
}: Props) => {
  const setNotification = useSetRecoilState(notificationState);
  const [input, setInput] = useState(initialInput);
  const [markdownInput, setMarkdownInput] = useState("");
  const [errors, setErrors] = useState<ErrorObj | undefined>();
  const [loading, setLoading] = useState(false);
  const [newImage, setNewImage] = useState<NewImage | undefined>();
  const [imageURL, setImageURL] = useState<string | undefined>(newsitem?.imageUrl);
  const [imageToCrop, setImageToCrop] = useState<File | undefined>();
  const currItemHasImage = Boolean(newsitem && newsitemsWithImageIds.includes(newsitem.id));

  useEffect(() => {
    const getInitialInput = () => {
      if (newsitem) {
        setInput({
          title: newsitem.title,
          date: format(newsitem.date.toDate(), "yyyy-MM-dd"),
        });
        setMarkdownInput(newsitem.message);
        if (newsitem.imageUrl) setImageURL(newsitem.imageUrl);
      }
    };
    getInitialInput();
  }, [newsitem]);

  const handleClose = (edited?: boolean) => {
    setInput(initialInput);
    setMarkdownInput("");
    setErrors(undefined);
    setImageURL(undefined);
    setNewImage(undefined);
    if (edited) onEdited();
    onClose();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput((prevValue) => ({ ...prevValue, [e.target.name]: e.target.value }));
  };

  const handleMarkdownInputChange = (input?: string) => {
    setMarkdownInput(input ? input : "");
  };

  const handleSelectImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setImageToCrop(file);
    }
  };

  const handleAddImage = (blob: Blob) => {
    setNewImage({ name: "file.name", blob: blob });
    setImageToCrop(undefined);
  };

  const handleDeleteImage = () => {
    setImageURL(undefined);
    setNewImage(undefined);
  };

  const handleDelete = async (id: string, itemHasImage: boolean) => {
    try {
      await deleteNewsItem(id, itemHasImage);
      setNotification({ message: "Het nieuwsitem is verwijderd", severity: "success" });
      handleClose(true);
    } catch (error) {
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
      await updateNewsItem(id, {
        title: input.title,
        date: new Date(input.date),
        message: markdownInput,
      });

      if (newImage) {
        await updateImage("newsitems", newImage.blob, id);
      } else if (currItemHasImage && !imageURL) {
        await deleteImage("newsitems", id);
      }

      setNotification({ message: "Het nieuwsitem is aangepast", severity: "success" });
      handleClose(true);
    } catch (_) {
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
      const newId = await createNewsitem({
        title: input.title,
        date: new Date(input.date),
        message: markdownInput,
        likes: 0,
      });
      if (newImage) {
        await updateImage("newsitems", newImage.blob, newId);
      }
      setNotification({ message: "Het nieuwsitem is toegevoegd", severity: "success" });
      handleClose(true);
    } catch (_) {
      setNotification({
        message: "Het is niet gelukt om het nieuwsitem toe te voegen",
        severity: "error",
      });
    }
    setLoading(false);
  };

  return (
    <InputDialog
      open={open}
      onClose={handleClose}
      title={`Nieuwsitem ${newsitem ? "aanpassen" : "plaatsen"}`}
      loading={loading}
      actions={
        <>
          <Button onClick={() => handleClose()} variant="outlined">
            Cancel
          </Button>
          {newsitem ? (
            <>
              <Button
                color="error"
                onClick={() => handleDelete(newsitem.id, currItemHasImage)}
                variant="outlined"
              >
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
        </>
      }
    >
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
      <Button
        variant="contained"
        component="label"
        disabled={Boolean(newImage || imageURL)}
        startIcon={<PhotoCamera />}
      >
        Afbeelding uploaden
        <input accept=".jpg,.png" type="file" hidden onChange={handleSelectImage} />
      </Button>
      {(newImage || imageURL) && (
        <>
          <ListItem>
            {newImage && (
              <>
                <ListItemAvatar>
                  <Avatar alt="fail" src={URL.createObjectURL(newImage.blob)} />
                </ListItemAvatar>
                <ListItemText className="list-item-text" primary={newImage.name} />
              </>
            )}
            {imageURL && (
              <>
                <ListItemAvatar>
                  <Avatar alt="fail" src={imageURL} />
                </ListItemAvatar>
                <ListItemText className="list-item-text" primary="Newsitem image" />
              </>
            )}
            <IconButton onClick={handleDeleteImage}>
              <Delete />
            </IconButton>
          </ListItem>
        </>
      )}

      <MarkdownEditor value={markdownInput} onChange={handleMarkdownInputChange} />
      {errors?.message && <Typography color="error">{errors.message}</Typography>}
      <CropImageDialog
        imageToCrop={imageToCrop}
        onClose={() => setImageToCrop(undefined)}
        onUpload={handleAddImage}
        loading={false}
        aspectRatio={20 / 15}
      />
    </InputDialog>
  );
};
