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
import { InputDialog } from "../../components/InputDialog";
import { Dog } from "../../models/dogKennel";
import { NewImage } from "../../models/images";
import { CropImageDialog } from "../../components/CropImageDialog";
import { validateDog } from "../../validation/validateDog";
import { format } from "date-fns";
import { createDog, deleteDog, updateDog } from "../../services/dogService";
import { updateImage } from "../../services/imageService";

interface ErrorObj {
  name?: string;
  dateOfBirth?: string;
  description?: string;
  image?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  dog?: Dog;
  onEdited: () => void;
  directory: string;
}

const initialInput = { name: "", dateOfBirth: "", description: "" };

export const DogDialog = ({ open, onClose, dog, onEdited, directory }: Props) => {
  const setNotification = useSetRecoilState(notificationState);
  const [input, setInput] = useState(initialInput);
  const [errors, setErrors] = useState<ErrorObj | undefined>();
  const [loading, setLoading] = useState(false);
  const [newImage, setNewImage] = useState<NewImage | undefined>();
  const [imageURL, setImageURL] = useState<string | undefined>();
  const [imageToCrop, setImageToCrop] = useState<File | undefined>();

  useEffect(() => {
    if (dog) {
      setInput({
        name: dog.name,
        dateOfBirth: format(dog.dateOfBirth.toDate(), "yyyy-MM-dd"),
        description: dog.description,
      });
      setImageURL(dog.imageUrl);
    }
  }, [dog]);

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
      await deleteDog(id, directory);
      setNotification({ message: "De hond is verwijderd", severity: "success" });
      handleClose(true);
    } catch (error) {
      console.log(error);
      setNotification({
        message: "Het is niet gelukt om de hond te verwijderen",
        severity: "error",
      });
    }
  };

  const handleUpdate = async (id: string) => {
    setLoading(true);
    setErrors(undefined);
    setErrors(undefined);
    let errors = await validateDog(input);
    if (!newImage && !imageURL) {
      if (!errors) errors = { image: "Een afbeelding is verplicht" };
      else errors["image"] = "Een afbeelding is verplicht";
    }
    if (errors) {
      setLoading(false);
      return setErrors(errors);
    }

    try {
      await updateDog(id, input, directory);
      if (newImage) {
        await updateImage(directory, newImage.blob, id);
      }
      setNotification({ message: "De hond is aangepast", severity: "success" });
      handleClose(true);
    } catch (error) {
      console.log(error);
      setNotification({
        message: "Het is niet gelukt om de hond aan te passen",
        severity: "error",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors(undefined);
    let errors = await validateDog(input);
    if (!newImage) {
      if (!errors) errors = { image: "Een afbeelding is verplicht" };
      else errors["image"] = "Een afbeelding is verplicht";
    }
    if (errors) {
      setLoading(false);
      return setErrors(errors);
    }

    try {
      const newId = await createDog(input, directory);
      await updateImage(directory, newImage!.blob, newId);
      setNotification({ message: "De Ierse terriër toegevoegd", severity: "success" });
      handleClose(true);
    } catch (_) {
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
      title={`Ierse terriër ${dog ? "aanpassen" : "toevoegen"}`}
      loading={loading}
      actions={
        <>
          <Button onClick={() => handleClose()} variant="outlined">
            Cancel
          </Button>
          {dog ? (
            <>
              <Button color="error" onClick={() => handleDelete(dog.id)} variant="outlined">
                Verwijderen
              </Button>
              <Button disabled={loading} onClick={() => handleUpdate(dog.id)} variant="contained">
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
