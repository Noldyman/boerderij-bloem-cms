import { useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { InformativeText, InformativeTextCollection } from "../../../models/texts";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../../services/notifications";
import { deleteImage, getImageUrl } from "../../../services/imageService";
import { InformativeTextCard } from "./InformativeTextCard";
import {
  getInformativeTextCollection,
  postInformativeTextCollection,
  updateInformativeTextCollection,
} from "../../../services/informativeTextService";

interface Props {
  page: string;
}

export const SiteInformation = ({ page }: Props) => {
  const setNotification = useSetRecoilState(notificationState);
  const [loading, setLoading] = useState(false);
  const [collection, setCollection] = useState<InformativeTextCollection>();
  const [imageUrlsLoading, setImageUrlsLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const [createNewItem, setCreateNewItem] = useState(false);
  const [componentMounted, setComponentMounted] = useState(false);

  useEffect(() => {
    const getCollection = async () => {
      setLoading(true);
      try {
        const collection = await getInformativeTextCollection(page);
        if (collection) {
          setCollection(collection);
        } else {
          const newCollectionId = await postInformativeTextCollection({ page, infoTexts: [] });
          setCollection({ id: newCollectionId, page, infoTexts: [] });
        }
      } catch (_) {
        setNotification({
          message: "Het is niet gelukt om de informatieve teksten op te halen",
          severity: "error",
        });
      }
      setLoading(false);
    };
    getCollection();
  }, [page, setNotification]);

  useEffect(() => {
    const fetchImageUrls = async () => {
      if (!collection) return;
      setImageUrlsLoading(true);
      let newImageUrls = { ...imageUrls };
      await Promise.all(
        collection.infoTexts.map(async (item) => {
          if (!newImageUrls[item.imageId]) {
            const newUrl = await getImageUrl("informativetexts", item.imageId);
            newImageUrls[item.imageId] = newUrl;
          }
        })
      );
      setImageUrls(newImageUrls);
      setImageUrlsLoading(false);
    };
    fetchImageUrls();
  }, [collection]); // eslint-disable-line

  useEffect(() => {
    const updateCollection = async () => {
      if (!collection) return;
      else if (!componentMounted) return setComponentMounted(true);
      try {
        await updateInformativeTextCollection(collection.id, {
          page,
          infoTexts: [...collection.infoTexts],
        });
        setNotification({
          message: "De aanpassingen zijn opgeslagen",
          severity: "success",
        });
      } catch (_) {
        setNotification({
          message: "Het is niet gelukt om de aanpassingen op te slaan",
          severity: "error",
        });
      }
    };
    updateCollection();
  }, [collection, page, setNotification]); // eslint-disable-line

  const handleAddItem = (input: InformativeText, newImageUrl?: string) => {
    if (newImageUrl) {
      setImageUrls((prevValue) => {
        let newImageUrls = { ...prevValue };
        newImageUrls[input.imageId] = newImageUrl;
        return newImageUrls;
      });
    }

    setCollection((prevValue) => {
      if (!prevValue) return;
      return { ...prevValue, infoTexts: [...prevValue.infoTexts, input] };
    });
    setCreateNewItem(false);
  };

  const changeItem = (input: InformativeText, index: number, newImageUrl?: string) => {
    if (newImageUrl) {
      setImageUrls((prevValue) => {
        let newImageUrls = { ...prevValue };
        newImageUrls[input.imageId] = newImageUrl;
        return newImageUrls;
      });
    }
    setCollection((prevValue) => {
      if (!prevValue) return;
      const newInfoTexts = prevValue.infoTexts.map((item, i) => {
        if (i === index) return input;
        return item;
      });
      return { ...prevValue, infoTexts: newInfoTexts };
    });
  };

  const handleDeleteItem = async (index?: number) => {
    if (index === undefined) {
      setCreateNewItem(false);
    } else {
      setCollection((prevValue) => {
        if (!prevValue) return;
        deleteImage("informativetexts", prevValue.infoTexts[index].imageId);
        const newInfoTexts = prevValue.infoTexts.filter((_, i) => i !== index);
        return { ...prevValue, infoTexts: newInfoTexts };
      });
    }
  };

  const handleCreateNewItem = () => {
    setCreateNewItem(true);
  };

  const handleMoveInformation = async (index: number, move: "up" | "down") => {
    setCollection((prevValue) => {
      if (!prevValue) return;
      const item = { ...prevValue.infoTexts[index] };
      const newInfoTexts = prevValue.infoTexts.filter((_, i) => i !== index);
      if (move === "up") {
        newInfoTexts.splice(index - 1, 0, item);
      } else {
        newInfoTexts.splice(index + 1, 0, item);
      }
      return { ...prevValue, infoTexts: newInfoTexts };
    });
  };

  if (loading)
    return (
      <div className="loader-div">
        <CircularProgress />
      </div>
    );

  return (
    <div className="site-information">
      {collection?.infoTexts.map((item, index) => {
        const isFirstItem = Boolean(index === 0);
        const isLastItem = Boolean(index === collection.infoTexts.length - 1);
        return (
          <InformativeTextCard
            key={index}
            item={item}
            imageUrl={imageUrls[item.imageId] || ""}
            imageUrlsLoading={imageUrlsLoading}
            onMove={(move) => handleMoveInformation(index, move)}
            isFirstItem={isFirstItem}
            isLastItem={isLastItem}
            onChange={(input, newImageUrl) => changeItem(input, index, newImageUrl)}
            onDelete={() => handleDeleteItem(index)}
          />
        );
      })}
      {createNewItem && (
        <InformativeTextCard
          imageUrl=""
          item={{ title: "", text: "", imageId: "" }}
          onChange={handleAddItem}
          onDelete={() => handleDeleteItem()}
        />
      )}
      <div className="site-information-actions">
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleCreateNewItem()}
          disabled={createNewItem}
        >
          Informatieve tekst toevoegen
        </Button>
      </div>
    </div>
  );
};
