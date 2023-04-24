import { Button, IconButton, LinearProgress, TextField, Tooltip, Typography } from "@mui/material";
import { AppCard } from "../AppCard";
import { MarkdownEditor } from "../MarkdownEditor";
import { ChangeEvent, useState } from "react";
import { ArrowCircleDown, ArrowCircleUp } from "@mui/icons-material";
import { CropImageDialog } from "../../CropImageDialog";
import { postTextContent, updateTextContent } from "../../../services/textService";
import { updateImage } from "../../../services/imageService";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../../services/notifications";
import { InformativeText } from "../../../models/texts";

interface Props {
  item: InformativeText;
  page: string;
  onMove?: (addIndex: 1 | -1) => void;
  isFirstItem?: boolean;
  isLastItem?: boolean;
  onNewInformation: (textId: string, newItem: InformativeText) => void;
  onDelete: () => void;
}

export const InformativeTextCard = ({
  item,
  page,
  onMove,
  isFirstItem,
  isLastItem,
  onNewInformation,
  onDelete,
}: Props) => {
  const setNotification = useSetRecoilState(notificationState);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [text, setText] = useState(item.text);
  const [imageToCrop, setImageToCrop] = useState<File>();
  const [newImage, setNewImage] = useState<Blob>();
  const [error, setError] = useState("");
  const itemHasBeenEdited = Boolean(title !== item.title || text !== item.text || newImage);

  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleChangeText = (input?: string) => {
    setText(input ? input : "");
  };

  const handleClearText = () => {
    setText("");
  };

  const handleSelectImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (e.target.files) {
      const file = e.target.files[0];
      setImageToCrop(file);
    }
  };

  const handleImageUpload = async (blob: Blob) => {
    setNewImage(blob);
    setImageToCrop(undefined);
  };

  const imageSource = () => {
    if (newImage) return URL.createObjectURL(newImage);
    else if (item.imageUrl) return item.imageUrl;
    else return "";
  };

  const validate = () => {
    if (!title) return "Titel is verplicht";
    else if (!text) return "Informatietekst is verplicht";
    else if (!newImage && !item.imageUrl) return "Een afbeelding is verplicht";
    else return "";
  };

  const handleSubmit = async () => {
    setError("");
    const error = validate();
    if (error) return setError(error);

    setLoading(true);
    if (!item.id) {
      try {
        const newItemId = await postTextContent(text, page, "info", title);
        if (newImage) {
          await updateImage("info", newImage, newItemId);
          onNewInformation(newItemId, {
            id: newItemId,
            title,
            text,
            imageUrl: URL.createObjectURL(newImage),
          });
          setNotification({ message: "De informatieve tekst is opgeslagen", severity: "success" });
        }
      } catch (err) {
        setNotification({
          message: "Het is niet gelukt om de informatieve tekst op te slaan",
          severity: "error",
        });
      }
    } else {
      try {
        await updateTextContent(item.id, text, page, "info", title);
        if (newImage) {
          await updateImage("info", newImage, item.id);
        }
        setNotification({ message: "De informatieve tekst is aangepast", severity: "success" });
      } catch (err) {
        setNotification({
          message: "Het is niet gelukt om de informatieve tekst op te slaan",
          severity: "error",
        });
      }
    }
    setLoading(false);
  };

  return (
    <AppCard title="Informatieve tekst" hasLoader>
      <div className="info-card-content">
        <div className="card-content">
          <TextField label="Titel" size="small" value={title} onChange={handleChangeTitle} />
          <MarkdownEditor value={text} onChange={handleChangeText} />
        </div>
        <div className="info-card-image">
          <img width="100%" src={imageSource()} alt="Geen afbeelding" />
        </div>
      </div>
      {error && <Typography color="error">{error}</Typography>}
      <div className="card-actions">
        {onMove && (
          <div>
            <Tooltip title="Verplaats naar onder">
              <span>
                <IconButton color="primary" disabled={isLastItem} onClick={() => onMove(1)}>
                  <ArrowCircleDown />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Verplaats naar boven">
              <span>
                <IconButton color="primary" disabled={isFirstItem} onClick={() => onMove(-1)}>
                  <ArrowCircleUp />
                </IconButton>
              </span>
            </Tooltip>
          </div>
        )}
        <Button variant="outlined" color="error" onClick={onDelete}>
          Verwijderen
        </Button>
        <Button variant="outlined" component="label">
          Foto uploaden
          <input accept=".jpg,.png" type="file" hidden onChange={handleSelectImage} />
        </Button>
        <Button onClick={handleClearText} disabled={loading || !text} variant="outlined">
          Leeg veld
        </Button>
        <Button onClick={handleSubmit} disabled={loading || !itemHasBeenEdited} variant="contained">
          Opslaan
        </Button>
      </div>
      {imageToCrop && (
        <CropImageDialog
          imageToCrop={imageToCrop}
          onClose={() => setImageToCrop(undefined)}
          onUpload={handleImageUpload}
          loading={false}
          aspectRatio={20 / 15}
        />
      )}
      {loading ? <LinearProgress /> : <div className="loader-placeholder" />}
    </AppCard>
  );
};
