import { useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { InformativeText } from "../../../models/texts";
import {
  deleteTextContent,
  getSiteInformationOrder,
  getTextContents,
  initSiteInformationOrder,
  updateSiteInformationOrder,
} from "../../../services/textService";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../../services/notifications";
import { deleteImage, getImageUrl } from "../../../services/imageService";
import { InformativeTextCard } from "./InformativeTextCard";

interface Props {
  page: string;
}

export const SiteInformation = ({ page }: Props) => {
  const setNotification = useSetRecoilState(notificationState);
  const [loading, setLoading] = useState(false);
  const [itemOrderDocId, setItemOrderDocId] = useState("");
  const [itemOrder, setItemOrder] = useState<string[]>([]);
  const [informativeTexts, setInformativeTexts] = useState<InformativeText[]>([]);
  const [createNewItem, setCreateNewItem] = useState(false);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const itemOrderObj = await getSiteInformationOrder(page);
        if (!itemOrderObj) {
          const newItemOrderObj = await initSiteInformationOrder(page);
          setItemOrderDocId(newItemOrderObj.docId);
          setItemOrder(newItemOrderObj.itemOrder);
        } else {
          setItemOrderDocId(itemOrderObj.docId);
          setItemOrder(itemOrderObj.itemOrder);
        }
        const textContents = await getTextContents(page, "info");
        if (textContents) {
          const newInformativeTexts = await Promise.all(
            textContents?.map(async (content) => {
              const imageUrl = await getImageUrl("info", content.id);
              return { ...content, imageUrl } as InformativeText;
            })
          );
          setInformativeTexts(newInformativeTexts);
        }
      } catch (_) {
        setNotification({
          message: "Het is niet gelukt om de informatieve teksten op te halen",
          severity: "error",
        });
      }
      setLoading(false);
    };
    getData();
  }, [page, setNotification]);

  useEffect(() => {
    const updateItemOrder = async () => {
      try {
        await updateSiteInformationOrder(itemOrderDocId, itemOrder);
      } catch (_) {
        setNotification({
          message: "Het is niet gelukt om de informatieve tekst te verplaatsen",
          severity: "error",
        });
      }
    };
    if (itemOrderDocId) {
      updateItemOrder();
    }
  }, [itemOrder, itemOrderDocId, setNotification]);

  const handleAddItemId = (itemId: string, newItem: InformativeText) => {
    setInformativeTexts((prevValue) => [...prevValue, newItem]);
    setItemOrder((prevValue) => [...prevValue, itemId]);
    setCreateNewItem(false);
  };

  const handleDeleteItem = async (id?: string) => {
    if (!id) {
      setCreateNewItem(false);
    } else {
      try {
        await deleteTextContent(id);
        await deleteImage("info", id);
        setItemOrder((prevValue) => prevValue.filter((itemId) => itemId !== id));
      } catch (err) {
        setNotification({
          message: "Het is niet gelukt om de informatieve tekst te verwijderen",
          severity: "error",
        });
      }
    }
  };

  const handleAddInformation = () => {
    setCreateNewItem(true);
  };

  const handleMoveInformation = async (id: string, addIndex: 1 | -1) => {
    const currentIndex = itemOrder.indexOf(id);
    let newItemOrder = itemOrder.filter((itemId) => itemId !== id);
    newItemOrder.splice(currentIndex + addIndex, 0, id);
    setItemOrder(newItemOrder);
  };

  if (loading)
    return (
      <div className="loader-div">
        <CircularProgress />
      </div>
    );

  return (
    <>
      <div className="site-information">
        {itemOrder.map((id, index) => {
          const item = informativeTexts.find((item) => item.id === id);
          const isFirstItem = Boolean(index === 0);
          const isLastItem = Boolean(index === itemOrder.length - 1);
          if (!item) return undefined;
          return (
            <InformativeTextCard
              key={item.id!}
              page={page}
              item={item}
              onMove={(addIndex) => handleMoveInformation(item.id!, addIndex)}
              isFirstItem={isFirstItem}
              isLastItem={isLastItem}
              onNewInformation={handleAddItemId}
              onDelete={() => handleDeleteItem(item.id!)}
            />
          );
        })}
        {createNewItem && (
          <InformativeTextCard
            page={page}
            item={{ title: "", text: "" }}
            onNewInformation={handleAddItemId}
            onDelete={() => handleDeleteItem()}
          />
        )}
        <div className="site-information-actions">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleAddInformation()}
            disabled={createNewItem}
          >
            Informatieve tekst toevoegen
          </Button>
        </div>
      </div>
    </>
  );
};
