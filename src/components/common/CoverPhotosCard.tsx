import { useState, useEffect, ChangeEvent } from "react";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../services/notifications";
import { storage } from "../../app/firebase";
import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { AppCard } from "./AppCard";
import {
  Button,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { CropImageDialog } from "../CropImageDialog";

export interface CoverPhoto {
  id: string;
  imgUrl: string;
}

interface Props {
  page: string;
}

export const CoverPhotosCard = ({ page }: Props) => {
  const setNotification = useSetRecoilState(notificationState);
  const [coverPhotos, setCoverPhotos] = useState<CoverPhoto[]>([]);
  const [coverPhotosLoading, setCoverPhotosLoading] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<File | undefined>();
  const [cropImageLoading, setCropImageLoading] = useState(false);

  useEffect(() => {
    const fetchCoverPhotos = async () => {
      setCoverPhotosLoading(true);
      try {
        const listRef = ref(storage, `images/coverphotos/${page}`);
        const res = await listAll(listRef);

        const newCoverPhotos = await Promise.all(
          res.items.map(async (item) => {
            const id = item.name;
            const imgRef = ref(storage, item.fullPath);
            const imgUrl = await getDownloadURL(imgRef);

            return { id, imgUrl };
          })
        );
        setCoverPhotos(newCoverPhotos);
      } catch (error) {
        console.log(error);
      }
      setCoverPhotosLoading(false);
    };
    fetchCoverPhotos();
  }, [page]);

  const handleSelectCoverPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (e.target.files) {
      const file = e.target.files[0];
      setImageToCrop(file);
    }
  };

  const handleDeleteCoverPhoto = async (id: string) => {
    try {
      const imgRef = ref(storage, `images/coverphotos/${page}/${id}`);
      await deleteObject(imgRef).catch((err) => {
        if (!err.message.includes("storage/object-not-found")) throw Error(err);
      });
      setCoverPhotos((prevValue) => prevValue.filter((p) => p.id !== id));
      setNotification({ message: "De foto is verwijderd", severity: "success" });
    } catch (error) {
      console.log(error);
      setNotification({
        message: "Het is niet gelukt om de foto te verwijderen",
        severity: "error",
      });
    }
  };

  const handleImageUpload = async (blob: Blob) => {
    setCropImageLoading(true);
    const id = crypto.randomUUID();
    const imgRef = ref(storage, `images/coverphotos/${page}/${id}`);
    const imgUrl = URL.createObjectURL(blob);

    try {
      await uploadBytes(imgRef, blob);
      setCoverPhotos((prevValue) => [...prevValue, { id, imgUrl }]);
      setImageToCrop(undefined);
      setNotification({ message: "De omslagfoto is opgeslagen", severity: "success" });
    } catch (err) {
      console.log(err);
      setNotification({
        message: "Het is niet gelukt om de omslagfoto op te slaan",
        severity: "error",
      });
    }
    setCropImageLoading(false);
  };

  return (
    <AppCard title="Omslagfoto's">
      <Typography>
        Je kunt maximaal 5 omslagfoto's uploaden om weer te geven op de pagina.
      </Typography>
      {coverPhotosLoading ? (
        <CircularProgress />
      ) : (
        <ImageList className="img-list" cols={5} rowHeight={200} variant="quilted">
          {coverPhotos.map((photo, i) => (
            <ImageListItem key={photo.id}>
              <img src={photo.imgUrl} alt="Geen afbeelding" />
              <ImageListItemBar
                title={"Omslagfoto " + (i + 1)}
                actionIcon={
                  <IconButton
                    sx={{ color: "#fff" }}
                    onClick={() => handleDeleteCoverPhoto(photo.id)}
                  >
                    <Delete />
                  </IconButton>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
      <div className="card-actions">
        <Button variant="contained" component="label" disabled={Boolean(!(coverPhotos.length < 5))}>
          Omslagfoto's uploaden
          <input accept=".jpg,.png" type="file" hidden onChange={handleSelectCoverPhoto} />
        </Button>
      </div>
      <CropImageDialog
        imageToCrop={imageToCrop}
        onClose={() => setImageToCrop(undefined)}
        onUpload={handleImageUpload}
        loading={cropImageLoading}
        aspectRatio={20 / 15}
      />
    </AppCard>
  );
};
