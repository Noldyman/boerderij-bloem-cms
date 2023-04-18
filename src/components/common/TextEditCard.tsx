import { Button, Card, CircularProgress, Typography } from "@mui/material";
import { MarkdownEditor } from "./MarkdownEditor";
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../services/notifications";
import { getIntroText, postTextContent, updateTextContent } from "../../services/textService";

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
        const introTextContent = await getIntroText(page);
        if (introTextContent) {
          setTextId(introTextContent.id);
          setText(introTextContent.text);
        }
      } catch (_) {
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
        await updateTextContent(textId, text, page, identifier);
      } else {
        await postTextContent(text, page, identifier);
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
    <Card className="card" variant="outlined">
      <div className="card-content">
        <Typography variant="h6">{title}</Typography>
        {loading ? <CircularProgress /> : <MarkdownEditor value={text} onChange={handleChange} />}
        <div className="card-actions">
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
