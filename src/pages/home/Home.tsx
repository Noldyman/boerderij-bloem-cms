import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../services/notifications";
import { db } from "../../app/firebase";
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
import { PageCard } from "../../components/common/PageCard";
import { NewsitemDialog } from "./NewsitemDialog";
import { NewsitemList } from "./NewsitemList";
import { MarkdownEditor } from "../../components/common/MarkdownEditor";
import { Button, Card, Typography } from "@mui/material";
import styles from "../../styles/general.module.scss";

export interface Newsitem {
  id: string;
  title: string;
  date: Timestamp;
  message: string;
}

export const Home = () => {
  const setNotification = useSetRecoilState(notificationState);
  const [introText, setIntroText] = useState({ id: "", text: "" });
  const [introTextLoading, setIntroTextLoading] = useState(false);
  const [newsitems, setNewitems] = useState<Newsitem[]>([]);
  const [newsItemDialogIsOpen, setNewsItemDialogIsOpen] = useState(false);
  const [editNewsitem, setEditNewsitem] = useState<Newsitem | undefined>();
  const [newsitemsWasEdited, setNewsitemsWasEdited] = useState(true);

  useEffect(() => {
    const fetchIntroText = async () => {
      try {
        const querySnapshot = await getDocs(
          query(collection(db, "introtext"), where("page", "==", "home"))
        );
        if (!querySnapshot.empty) {
          const id = querySnapshot.docs[0].id;
          const text = querySnapshot.docs[0].data().text.text;
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
      try {
        const querySnapshot = await getDocs(
          query(collection(db, "newsitems"), orderBy("date", "desc"))
        );
        if (!querySnapshot.empty) {
          const newNewsitems: Newsitem[] = querySnapshot.docs.map(
            (doc) => ({ ...doc.data(), id: doc.id } as Newsitem)
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
    };

    if (newsitemsWasEdited) {
      setNewsitemsWasEdited(false);
      fetchNewsitems();
    }
  }, [newsitemsWasEdited, setNotification]);

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
          text: introText,
        });
      } else {
        await addDoc(collection(db, "introtext"), {
          page: "home",
          text: introText,
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
    setNewsitemsWasEdited(true);
  };

  return (
    <PageCard title="Home">
      <Card className={styles.card} variant="outlined">
        <div className={styles.textEditBlock}>
          <Typography variant="h6">Introductietekst</Typography>
          <MarkdownEditor value={introText.text} onChange={handleIntroTextChange} />
          <div className={styles.blockActions}>
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
        <div className={styles.textEditBlock}>
          <Typography variant="h6">Nieuwsitems</Typography>
          <Typography>Voeg een nieuwsitem toe, of klik op een item om het te bewerken.</Typography>
          {newsitems.length > 0 && (
            <NewsitemList newsitems={newsitems} onEdit={handleEditNewsitem} />
          )}
          <div className={styles.blockActions}>
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
