import { ChangeEvent, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../services/notifications";
import { db, storage } from "../../app/firebase";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import {
  Button,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
} from "@mui/material";
import { Page } from "../../components/common/Page";
import { NewsitemDialog } from "./NewsitemDialog";
import { NewsitemList } from "./NewsitemList";
import { Delete } from "@mui/icons-material";
import styles from "../../styles/general.module.scss";
import { TextEditCard } from "../../components/common/TextEditCard";
import { AppCard } from "../../components/common/AppCard";
import { CropImageDialog } from "../../components/CropImageDialog";

interface CoverPhoto {
  id: string;
  imgUrl: string;
}

export interface Newsitem {
  id: string;
  title: string;
  date: Timestamp;
  message: string;
  imageUrl?: string;
}

export const Home = () => {
  const setNotification = useSetRecoilState(notificationState);
  const [coverPhotos, setCoverPhotos] = useState<CoverPhoto[]>([]);
  const [coverPhotosLoading, setCoverPhotosLoading] = useState(false);
  const [newsitems, setNewitems] = useState<Newsitem[]>([]);
  const [newsitemsLoading, setNewitemsLoading] = useState(false);
  const [newsItemDialogIsOpen, setNewsItemDialogIsOpen] = useState(false);
  const [editNewsitem, setEditNewsitem] = useState<Newsitem | undefined>();
  const [refreshNewsitems, setRefreshNewsitems] = useState(true);
  const [imageToCrop, setImageToCrop] = useState<File | undefined>();
  const [cropImageLoading, setCropImageLoading] = useState(false);

  useEffect(() => {
    const fetchCoverPhotos = async () => {
      setCoverPhotosLoading(true);
      try {
        const listRef = ref(storage, "images/coverphotos/home");
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
  }, []);

  useEffect(() => {
    const fetchNewsitems = async () => {
      setNewitemsLoading(true);
      try {
        const querySnapshot = await getDocs(
          query(collection(db, "newsitems"), orderBy("date", "desc"))
        );
        if (!querySnapshot.empty) {
          const newNewsitems: Newsitem[] = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
              let newsItem = { ...doc.data(), id: doc.id } as Newsitem;

              const imgRef = ref(storage, "images/newsitems/" + doc.id);
              await getDownloadURL(imgRef)
                .then((link) => {
                  newsItem = { ...newsItem, imageUrl: link };
                })
                .catch((err) => {
                  if (!err.message.includes("storage/object-not-found")) throw Error(err);
                });

              return newsItem;
            })
          );

          setNewitems(newNewsitems);
        } else {
          setNewitems([]);
        }
      } catch (error) {
        console.error(error);
        setNotification({
          message: "Het is niet gelukt om een connectie met de database te maken",
          severity: "error",
        });
      }
      setNewitemsLoading(false);
    };

    if (refreshNewsitems) {
      setRefreshNewsitems(false);
      fetchNewsitems();
    }
  }, [refreshNewsitems, setNotification]);

  const handleSelectCoverPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (e.target.files) {
      const file = e.target.files[0];
      setImageToCrop(file);
    }
  };

  const handleImageUpload = async (blob: Blob) => {
    setCropImageLoading(true);
    const id = crypto.randomUUID();
    const imgRef = ref(storage, "images/coverphotos/home/" + id);
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

  const handleDeleteCoverPhoto = async (id: string) => {
    try {
      const imgRef = ref(storage, "images/coverphotos/home/" + id);
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

  const handleOpenNewsItemDialog = () => {
    setNewsItemDialogIsOpen(true);
  };

  const handleCloseNewsItemDialog = () => {
    setEditNewsitem(undefined);
    setNewsItemDialogIsOpen(false);
  };

  const handleEditNewsitem = (newsitem: Newsitem) => {
    setEditNewsitem({ ...newsitem });
    setNewsItemDialogIsOpen(true);
  };

  const handleNewsitemsEdited = () => {
    setRefreshNewsitems(true);
  };

  return (
    <Page title="Home">
      <AppCard title="Omslagfoto's">
        <Typography>Je kunt 5 omslagfoto's uploaden om weer te geven op de homepage.</Typography>
        {coverPhotosLoading ? (
          <CircularProgress />
        ) : (
          <ImageList className={styles.imgList} cols={5} rowHeight={200} variant="quilted">
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
        <div className={styles.cardActions}>
          <Button
            variant="contained"
            component="label"
            disabled={Boolean(!(coverPhotos.length < 5))}
          >
            Omslagfoto's uploaden
            <input accept=".jpg,.png" type="file" hidden onChange={handleSelectCoverPhoto} />
          </Button>
        </div>
      </AppCard>
      <TextEditCard title="Introductietekst" identifier="intro" page="home" />
      <AppCard title="Nieuwsitems">
        <Typography>Voeg een nieuwsitem toe, of klik op een item om het te bewerken.</Typography>
        {newsitemsLoading ? (
          <CircularProgress />
        ) : (
          <NewsitemList newsitems={newsitems} onEdit={handleEditNewsitem} />
        )}

        <div className={styles.cardActions}>
          <Button onClick={handleOpenNewsItemDialog} variant="contained">
            Nieuws item toevoegen
          </Button>
        </div>
        <CropImageDialog
          imageToCrop={imageToCrop}
          onClose={() => setImageToCrop(undefined)}
          onUpload={handleImageUpload}
          loading={cropImageLoading}
          aspectRatio={20 / 15}
        />
        <NewsitemDialog
          open={newsItemDialogIsOpen}
          onClose={handleCloseNewsItemDialog}
          newsitem={editNewsitem}
          onEdited={handleNewsitemsEdited}
        />
      </AppCard>
    </Page>
  );
};
