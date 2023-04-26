import {
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { AppCard } from "../AppCard";
import { MarkdownEditor } from "../MarkdownEditor";
import { ChangeEvent, useEffect, useState } from "react";
import { ArrowCircleDown, ArrowCircleUp } from "@mui/icons-material";
import { CropImageDialog } from "../../CropImageDialog";
import { postImage, updateImage } from "../../../services/imageService";
import { InformativeText } from "../../../models/texts";
import useWindowDimensions from "../../../utils/useWindowDimensions";

interface Props {
  item: InformativeText;
  onMove?: (move: "up" | "down") => void;
  isFirstItem?: boolean;
  isLastItem?: boolean;
  onChange: (input: InformativeText, newImageUrl?: string) => void;
  imageUrlsLoading?: boolean;
  imageUrl: string;
  onDelete: () => void;
}

export const InformativeTextCard = ({
  item,
  onMove,
  isFirstItem,
  isLastItem,
  onChange,
  imageUrlsLoading,
  imageUrl,
  onDelete,
}: Props) => {
  const windowDimensions = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [text, setText] = useState(item.text);
  const [imageToCrop, setImageToCrop] = useState<File>();

  const [newImage, setNewImage] = useState<Blob>();
  const [error, setError] = useState("");
  const itemHasBeenEdited = Boolean(title !== item.title || text !== item.text || newImage);
  const imageDir = "informativetexts";

  useEffect(() => {
    setTitle(item.title);
    setText(item.text);
    setNewImage(undefined);
  }, [item]);

  const handleChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleChangeText = (input?: string) => {
    setText(input ? input : "");
  };

  const handleRestore = () => {
    setTitle(item.title);
    setText(item.text);
    setNewImage(undefined);
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
    else if (imageUrl) return imageUrl;
    else return "";
  };

  const validate = () => {
    if (!title) return "Titel is verplicht";
    else if (!text) return "Informatietekst is verplicht";
    else if (!newImage && !imageUrl) return "Een afbeelding is verplicht";
    else return "";
  };

  const handleSubmit = async () => {
    setError("");
    const error = validate();
    if (error) return setError(error);

    setLoading(true);
    let imageId = item.imageId;
    let newImageUrl = "";
    if (newImage) {
      if (item.imageId) {
        await updateImage(imageDir, newImage, item.imageId);
        newImageUrl = await URL.createObjectURL(newImage);
      } else {
        const { id, imgUrl } = await postImage(imageDir, newImage);
        imageId = id;
        newImageUrl = imgUrl;
      }
    }
    onChange({ title, text, imageId }, newImageUrl);
    setLoading(false);
  };

  return (
    <AppCard title="Informatieve tekst" hasLoader>
      <div
        className={`info-card-content ${
          windowDimensions && windowDimensions.width < 700 && "info-card-content-wrap"
        }`}
      >
        <div className="card-content ">
          <TextField label="Titel" size="small" value={title} onChange={handleChangeTitle} />
          <MarkdownEditor value={text} onChange={handleChangeText} />
        </div>
        {!imageUrl && imageUrlsLoading ? (
          <div className="info-card-image">
            <CircularProgress />
          </div>
        ) : !imageUrl && !newImage ? (
          <div className="info-card-image info-card-image-empty">
            <Typography align="center" fontStyle="italic">
              Geen afbeelding geselecteerd
            </Typography>
          </div>
        ) : (
          <img className="info-card-image" src={imageSource()} alt="Geen afbeelding" />
        )}
      </div>
      {error && <Typography color="error">{error}</Typography>}
      <div className="card-actions">
        {onMove && (
          <div>
            <Tooltip title="Verplaats naar onder">
              <span>
                <IconButton color="primary" disabled={isLastItem} onClick={() => onMove("down")}>
                  <ArrowCircleDown />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Verplaats naar boven">
              <span>
                <IconButton color="primary" disabled={isFirstItem} onClick={() => onMove("up")}>
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
        <Button onClick={handleRestore} disabled={loading || !itemHasBeenEdited} variant="outlined">
          Herstel
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
