import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../services/notifications";
import { db, storage } from "../../app/firebase";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { Button, CircularProgress, Typography } from "@mui/material";
import { Page } from "../../components/common/Page";
import { NewsitemDialog } from "./NewsitemDialog";
import { NewsitemList } from "./NewsitemList";
import { TextEditCard } from "../../components/common/TextEditCard";
import { AppCard } from "../../components/common/AppCard";
import { CoverPhotosCard } from "../../components/common/CoverPhotosCard";
import styles from "../../styles/general.module.scss";

export interface Newsitem {
  id: string;
  title: string;
  date: Timestamp;
  message: string;
  imageUrl?: string;
}

export const Home = () => {
  const setNotification = useSetRecoilState(notificationState);

  const [newsitems, setNewitems] = useState<Newsitem[]>([]);
  const [newsitemsLoading, setNewitemsLoading] = useState(false);
  const [newsItemDialogIsOpen, setNewsItemDialogIsOpen] = useState(false);
  const [editNewsitem, setEditNewsitem] = useState<Newsitem | undefined>();
  const [refreshNewsitems, setRefreshNewsitems] = useState(true);

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
      <TextEditCard title="Introductietekst" identifier="intro" page="home" />
      <CoverPhotosCard page="home" />
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
