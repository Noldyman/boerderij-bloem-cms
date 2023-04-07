import { ChangeEvent, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../services/notifications";
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { uploadBytes, ref, deleteObject } from "firebase/storage";
import { db, storage } from "../../app/firebase";
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
import { InputDialog } from "../../components/InputDialog";
import { Terrier } from "../../models/irishTerriers";
import { NewImage } from "../../models/images";
import { CropImageDialog } from "../../components/CropImageDialog";
import { validateTerrier } from "../../validation/validateTerrier";
import { format } from "date-fns";

interface ErrorObj {
  name?: string;
  dateOfBirth?: string;
  description?: string;
  image?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  terrier?: Terrier;
  onEdited: () => void;
}

const initialInput = { name: "", dateOfBirth: "", description: "" };

export const TerrierDialog = ({ open, onClose, terrier, onEdited }: Props) => {
  const setNotification = useSetRecoilState(notificationState);
  const [input, setInput] = useState(initialInput);
  const [errors, setErrors] = useState<ErrorObj | undefined>();
  const [loading, setLoading] = useState(false);
  const [newImage, setNewImage] = useState<NewImage | undefined>();
  const [imageURL, setImageURL] = useState<string | undefined>();
  const [imageToCrop, setImageToCrop] = useState<File | undefined>();

  useEffect(() => {
    if (terrier) {
      setInput({
        name: terrier.name,
        dateOfBirth: format(terrier.dateOfBirth.toDate(), "yyyy-MM-dd"),
        description: terrier.description,
      });
      setImageURL(terrier.imageUrl);
    }
  }, [terrier]);

  const handleClose = (edited?: boolean) => {
    setInput(initialInput);
    setErrors(undefined);
    setImageURL(undefined);
    setNewImage(undefined);
    if (edited) onEdited();
    onClose();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput((prevValue) => ({ ...prevValue, [e.target.name]: e.target.value }));
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

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "terriers/" + id));
      if (newImage || imageURL) {
        const imgRef = ref(storage, "images/terriers/" + id);
        await deleteObject(imgRef).catch((err) => {
          if (!err.message.includes("storage/object-not-found")) throw Error(err);
        });
      }

      setNotification({ message: "De Ierse terriër is verwijderd", severity: "success" });
      handleClose(true);
    } catch (error) {
      console.log(error);
      setNotification({
        message: "Het is niet gelukt om de Ierse terriër te verwijderen",
        severity: "error",
      });
    }
  };

  const handleUpdate = async (id: string) => {
    setLoading(true);
    setErrors(undefined);
    setErrors(undefined);
    let errors = await validateTerrier(input);
    if (!newImage) {
      if (!errors) errors = { image: "Een afbeelding is verplicht" };
      else errors["image"] = "Een afbeelding is verplicht";
    }

    if (errors) {
      setLoading(false);
      return setErrors(errors);
    }
    try {
      await updateDoc(doc(db, "terriers/" + id), {
        ...input,
        dateOfBirth: new Date(input.dateOfBirth),
      });

      const imgRef = ref(storage, "images/terriers/" + id);
      if (newImage) {
        await uploadBytes(imgRef, newImage.blob);
      } else if (!imageURL) {
        await deleteObject(imgRef).catch((err) => {
          if (!err.message.includes("storage/object-not-found")) throw Error(err);
        });
      }

      setNotification({ message: "De Ierse terriër is aangepast", severity: "success" });
      handleClose(true);
    } catch (error) {
      console.log(error);
      setNotification({
        message: "Het is niet gelukt om de Ierse terriër aan te passen",
        severity: "error",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors(undefined);
    let errors = await validateTerrier(input);
    if (!newImage) {
      if (!errors) errors = { image: "Een afbeelding is verplicht" };
      else errors["image"] = "Een afbeelding is verplicht";
    }

    if (errors) {
      setLoading(false);
      return setErrors(errors);
    }

    try {
      const docRef = await addDoc(collection(db, "terriers"), {
        ...input,
        dateOfBirth: new Date(input.dateOfBirth),
      });
      if (newImage) {
        const storageRef = ref(storage, "images/terriers/" + docRef.id);
        await uploadBytes(storageRef, newImage.blob);
      }

      setNotification({ message: "De Ierse terriër toegevoegd", severity: "success" });
      handleClose(true);
    } catch (error) {
      console.log(error);
      setNotification({
        message: "Het is niet gelukt om de Ierse terriër toe te voegen",
        severity: "error",
      });
    }
    setLoading(false);
  };

  return (
    <InputDialog
      open={open}
      onClose={() => handleClose()}
      title={`Ierse terriër ${terrier ? "aanpassesn" : "toevoegen"}`}
      loading={loading}
      actions={
        <>
          <Button onClick={() => handleClose()} variant="outlined">
            Cancel
          </Button>
          {terrier ? (
            <>
              <Button color="error" onClick={() => handleDelete(terrier.id)} variant="outlined">
                Verwijderen
              </Button>
              <Button
                disabled={loading}
                onClick={() => handleUpdate(terrier.id)}
                variant="contained"
              >
                Aanpassen
              </Button>
            </>
          ) : (
            <Button disabled={loading} onClick={handleSubmit} variant="contained">
              Toevoegen
            </Button>
          )}
        </>
      }
    >
      <TextField
        inputProps={{ maxLength: 50 }}
        fullWidth
        size="small"
        label="Naam"
        name="name"
        placeholder="Naam"
        value={input.name}
        onChange={handleInputChange}
        error={Boolean(errors?.name)}
        helperText={errors?.name}
      />
      <TextField
        fullWidth
        size="small"
        type="date"
        name="dateOfBirth"
        label="Geboortedatum"
        InputLabelProps={{ shrink: true }}
        value={input.dateOfBirth}
        error={Boolean(errors?.dateOfBirth)}
        helperText={errors?.dateOfBirth}
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
      {errors?.image && (
        <Typography marginLeft={2} fontSize={12} color="error">
          {errors.image}
        </Typography>
      )}
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
      <TextField
        inputProps={{ maxLength: 500 }}
        fullWidth
        multiline
        rows={4}
        size="small"
        label="Omschrijving"
        name="description"
        placeholder="Omschrijving"
        value={input.description}
        onChange={handleInputChange}
        error={Boolean(errors?.description)}
        helperText={errors?.description}
      />
      <CropImageDialog
        imageToCrop={imageToCrop}
        onClose={() => setImageToCrop(undefined)}
        onUpload={handleAddImage}
        loading={false}
        aspectRatio={1}
        circularCrop={true}
      />
    </InputDialog>
  );
};
