import { useState, useEffect, ChangeEvent } from "react";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../services/notifications";
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
import { deleteImage, getCoverImageUrls, postImage } from "../../services/imageService";
import { Image } from "../../models/images";

interface Props {
  page: string;
}

export const CoverPhotosCard = ({ page }: Props) => {
  const setNotification = useSetRecoilState(notificationState);
  const [conerImageUrls, setCoverImageUrls] = useState<Image[]>([]);
  const [coverPhotosLoading, setCoverPhotosLoading] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<File | undefined>();
  const [cropImageLoading, setCropImageLoading] = useState(false);

  useEffect(() => {
    const fetchCoverPhotos = async () => {
      setCoverPhotosLoading(true);
      try {
        const newCoverImageUrls = await getCoverImageUrls(page);
        setCoverImageUrls(newCoverImageUrls);
      } catch (_) {
        setNotification({
          message: "Het is niet gelukt om een connectie met de database te maken",
          severity: "error",
        });
      }
      setCoverPhotosLoading(false);
    };
    fetchCoverPhotos();
  }, [page, setNotification]);

  const handleSelectCoverPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (e.target.files) {
      const file = e.target.files[0];
      setImageToCrop(file);
    }
  };

  const handleDeleteCoverPhoto = async (id: string) => {
    try {
      await deleteImage(`coverphotos/${page}`, id);
      setCoverImageUrls((prevValue) => prevValue.filter((p) => p.id !== id));
      setNotification({ message: "De foto is verwijderd", severity: "success" });
    } catch (_) {
      setNotification({
        message: "Het is niet gelukt om de foto te verwijderen",
        severity: "error",
      });
    }
  };

  const handleImageUpload = async (blob: Blob) => {
    setCropImageLoading(true);
    try {
      const newImage = await postImage(`coverphotos/${page}`, blob);
      setCoverImageUrls((prevValue) => [...prevValue, { ...newImage }]);
      setImageToCrop(undefined);
      setNotification({ message: "De omslagfoto is opgeslagen", severity: "success" });
    } catch (_) {
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
          {conerImageUrls.map((photo, i) => (
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
        <Button
          variant="contained"
          component="label"
          disabled={Boolean(!(conerImageUrls.length < 5))}
        >
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
