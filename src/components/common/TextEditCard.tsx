import { Button, Card, CircularProgress, Typography } from "@mui/material";
import { MarkdownEditor } from "./MarkdownEditor";
import styles from "../../styles/general.module.scss";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../services/notifications";
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../../app/firebase";

interface Props {
  title: string;
  page: string;
  identifier: string;
}

export const TextEditCard = ({ title, page, identifier }: Props) => {
  const setNotification = useSetRecoilState(notificationState);
  const [text, setText] = useState("");
  const [textId, setTextId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchText = async () => {
      try {
        const querySnapshot = await getDocs(
          query(
            collection(db, `texts`),
            where("page", "==", page),
            where("identifier", "==", identifier)
          )
        );
        if (!querySnapshot.empty) {
          const id = querySnapshot.docs[0].id;
          const text = querySnapshot.docs[0].data().text;
          setTextId(id);
          setText(text);
        }
      } catch (error) {
        console.error(error);
        setNotification({
          message: "Het is niet gelukt om een connectie met de database te maken",
          severity: "error",
        });
      }
    };

    fetchText();
  }, [identifier, page, setNotification]);

  const handleChange = (input?: string) => {
    setText(input ? input : "");
  };

  const handleClear = () => {
    setText("");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (textId) {
        await updateDoc(doc(db, `texts/${textId}`), {
          text,
          page,
          identifier,
        });
      } else {
        await addDoc(collection(db, `texts`), {
          text,
          page,
          identifier,
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
    setLoading(false);
  };

  return (
    <Card className={styles.card} variant="outlined">
      <div className={styles.cardContent}>
        <Typography variant="h6">{title}</Typography>
        {loading ? <CircularProgress /> : <MarkdownEditor value={text} onChange={handleChange} />}
        <div className={styles.cardActions}>
          <Button onClick={handleClear} disabled={loading || !text} variant="outlined">
            Leeg veld
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !text} variant="contained">
            Opslaan
          </Button>
        </div>
      </div>
    </Card>
  );
};
