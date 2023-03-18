import { ChangeEvent, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../services/notifications";
import { db, storage } from "../../app/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import {
  Button,
  Card,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
} from "@mui/material";
import { PageCard } from "../../components/common/PageCard";
import { NewsitemDialog } from "./NewsitemDialog";
import { NewsitemList } from "./NewsitemList";
import { MarkdownEditor } from "../../components/common/MarkdownEditor";
import { Delete } from "@mui/icons-material";
import styles from "../../styles/general.module.scss";

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
  const [introText, setIntroText] = useState({ id: "", text: "" });
  const [introTextLoading, setIntroTextLoading] = useState(false);
  const [newsitems, setNewitems] = useState<Newsitem[]>([]);

  const [coverPhotos, setCoverPhotos] = useState<CoverPhoto[]>([]);
  const [coverPhotosLoading, setCoverPhotosLoading] = useState(false);

  const [newsitemsLoading, setNewitemsLoading] = useState(false);
  const [newsItemDialogIsOpen, setNewsItemDialogIsOpen] = useState(false);
  const [editNewsitem, setEditNewsitem] = useState<Newsitem | undefined>();
  const [refreshNewsitems, setRefreshNewsitems] = useState(true);

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
    const fetchIntroText = async () => {
      try {
        const querySnapshot = await getDocs(
          query(collection(db, "introtext"), where("page", "==", "home"))
        );
        if (!querySnapshot.empty) {
          const id = querySnapshot.docs[0].id;
          const text = querySnapshot.docs[0].data().text;
          setIntroText({ id, text });
        }
      } catch (error) {
        console.error(error);
        setNotification({
          message: "Het is niet gelukt om een connectie met de database te maken",
          severity: "error",
        });
      }
    };

    fetchIntroText();
  }, [setNotification]);

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

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const allowedNumOfFiles = 5 - coverPhotos.length;
    if (files.length > allowedNumOfFiles) {
      return setNotification({
        message: `Te veel foto's geselecteerd. Je kunt nog maximaal ${allowedNumOfFiles} foto's uploaden`,
        severity: "warning",
      });
    }

    const newCoverPhotos = await Promise.all(
      files.map(async (f) => {
        const id = crypto.randomUUID();
        const imgRef = ref(storage, "images/coverphotos/home/" + id);
        const blob = new Blob([f]);
        const imgUrl = URL.createObjectURL(blob);
        await uploadBytes(imgRef, blob);
        return { id, imgUrl };
      })
    );

    setCoverPhotos((prevValue) => [...prevValue, ...newCoverPhotos]);
    setNotification({ message: `Er zijn ${files.length} foto's geüpload`, severity: "success" });
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

  const handleIntroTextChange = (input?: string) => {
    if (!input) return;
    setIntroText((prevValue) => ({ ...prevValue, text: input }));
  };

  const handleClearIntroText = () => {
    setIntroText((prevValue) => ({ ...prevValue, text: "" }));
  };

  const handleSubmitIntroText = async () => {
    setIntroTextLoading(true);
    try {
      if (introText.id) {
        await updateDoc(doc(db, "introtext/" + introText.id), {
          page: "home",
          text: introText.text,
        });
      } else {
        await addDoc(collection(db, "introtext"), {
          page: "home",
          text: introText.text,
        });
      }
      setNotification({ message: "De aanpassingen zijn opgeslagen", severity: "success" });
    } catch (error) {
      console.log(error);
      setNotification({
        message: "Het is niet gelukt om de aanpassingen op te slaan",
        severity: "error",
      });
    }
    setIntroTextLoading(false);
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
    <PageCard title="Home">
      <Card className={styles.card} variant="outlined">
        <div className={styles.cardContent}>
          <Typography variant="h6">Omslagfoto's</Typography>
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
              <input accept=".jpg,.png" type="file" hidden multiple onChange={handleImageUpload} />
            </Button>
          </div>
        </div>
      </Card>
      <Card className={styles.card} variant="outlined">
        <div className={styles.cardContent}>
          <Typography variant="h6">Introductietekst</Typography>
          <MarkdownEditor value={introText.text} onChange={handleIntroTextChange} />
          <div className={styles.cardActions}>
            <Button onClick={handleClearIntroText} variant="outlined">
              Leeg veld
            </Button>
            <Button
              onClick={handleSubmitIntroText}
              disabled={introTextLoading || !introText.text}
              variant="contained"
            >
              Opslaan
            </Button>
          </div>
        </div>
      </Card>

      <Card className={styles.card} variant="outlined">
        <div className={styles.cardContent}>
          <Typography variant="h6">Nieuwsitems</Typography>
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
        </div>
        <NewsitemDialog
          open={newsItemDialogIsOpen}
          onClose={handleCloseNewsItemDialog}
          newsitem={editNewsitem}
          onEdited={handleNewsitemsEdited}
        />
      </Card>
    </PageCard>
  );
};
