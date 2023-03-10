import { Button, TextareaAutosize, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { PageCard } from "../components/common/PageCard";
import styles from "../styles/general.module.scss";
import { set, ref, get, child } from "firebase/database";
import { db } from "../app/firebase";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../services/notifications";

export const Home = () => {
  const setNotification = useSetRecoilState(notificationState);
  const [introText, setIntroText] = useState("");
  const [introTextLoading, setIntroTextLoading] = useState(false);

  useEffect(() => {
    const getInitialData = async () => {
      const dbRef = ref(db);
      get(child(dbRef, "introtext/home"))
        .then((snapshot) => {
          if (snapshot.exists()) {
            setIntroText(snapshot.val().text);
          }
        })
        .catch((error) => {
          console.error(error);
          setNotification({
            message: "Het is niet gelukt om een connectie met de database te maken",
            severity: "error",
          });
        });
    };
    getInitialData();
  }, [setNotification]);

  const handleIntroTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setIntroText(e.target.value);
  };

  const handleClearIntroText = () => {
    setIntroText("");
  };

  const handleSubmitIntroText = async () => {
    setIntroTextLoading(true);
    try {
      await set(ref(db, "introtext/home"), {
        text: introText,
      });
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

  return (
    <PageCard title="Home">
      <div className={styles.textEreaBlock}>
        <Typography variant="h6">Introductie tekst</Typography>
        <TextareaAutosize
          className={styles.textErea}
          placeholder="Vul hier de introductie tekst in voor de home pagina."
          value={introText}
          onChange={handleIntroTextChange}
        />
        <div className={styles.blockActions}>
          <Button onClick={handleClearIntroText} variant="contained" color="secondary">
            Leeg veld
          </Button>
          <Button onClick={handleSubmitIntroText} disabled={introTextLoading} variant="contained">
            Opslaan
          </Button>
        </div>
      </div>
    </PageCard>
  );
};
