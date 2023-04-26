import { Button, LinearProgress } from "@mui/material";
import { MarkdownEditor } from "./MarkdownEditor";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../services/notifications";
// import { getIntroText, postTextContent, updateTextContent } from "../../services/textService";
import { AppCard } from "./AppCard";
import { getIntroText, postIntroText, updateIntroText } from "../../services/introTextService";
import { IntroText } from "../../models/texts";

interface Props {
  page: string;
}

export const IntroTextCard = ({ page }: Props) => {
  const setNotification = useSetRecoilState(notificationState);
  const [lastSavedIntroText, setLastSavedIntroText] = useState<IntroText>();
  const [textId, setTextId] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchText = async () => {
      try {
        const introText = await getIntroText(page);
        if (introText) {
          setLastSavedIntroText({ ...introText });
          setText(introText.text);
          setTextId(introText.id);
        }
      } catch (_) {
        setNotification({
          message: "Het is niet gelukt om de introductietekst op te halen",
          severity: "error",
        });
      }
    };
    fetchText();
  }, [page, setNotification]);

  const handleChange = (input?: string) => {
    setText(input ? input : "");
  };

  const handleClear = () => {
    setText("");
  };

  const handleRestore = () => {
    if (!lastSavedIntroText?.text) return;
    setText(lastSavedIntroText.text);
  };

  const restoreIsDisabled = () => {
    return Boolean(loading || lastSavedIntroText?.text === text);
  };
  const saveIsDisabled = () => {
    return Boolean(loading || !text || lastSavedIntroText?.text === text);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (textId) {
        await updateIntroText(textId, { text, page });
        setLastSavedIntroText({ id: textId, text, page });
      } else {
        const newId = await postIntroText({ text, page });
        setTextId(newId);
        setLastSavedIntroText({ id: newId, text, page });
      }
      setNotification({ message: "De aanpassingen zijn opgeslagen", severity: "success" });
    } catch (_) {
      setNotification({
        message: "Het is niet gelukt om de aanpassingen op te slaan",
        severity: "error",
      });
    }
    setLoading(false);
  };

  return (
    <AppCard title="Introductietekst" hasLoader>
      <MarkdownEditor value={text} onChange={handleChange} />
      <div className="card-actions">
        <Button onClick={handleClear} disabled={loading || !text} variant="outlined">
          Leeg veld
        </Button>
        <Button onClick={handleRestore} disabled={restoreIsDisabled()} variant="outlined">
          Herstel
        </Button>
        <Button onClick={handleSubmit} disabled={saveIsDisabled()} variant="contained">
          Opslaan
        </Button>
      </div>
      {loading ? <LinearProgress /> : <div className="loader-placeholder" />}
    </AppCard>
  );
};
