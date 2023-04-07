import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db, storage } from "../../app/firebase";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../services/notifications";
import {
  Avatar,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { Pets } from "@mui/icons-material";
import { Page } from "../../components/common/Page";
import { AppCard } from "../../components/common/AppCard";
import { TextEditCard } from "../../components/common/TextEditCard";
import { CoverPhotosCard } from "../../components/common/CoverPhotosCard";
import { TerrierDialog } from "./TerrierDialog";
import { Terrier } from "../../models/irishTerriers";
import { format } from "date-fns";

export const IrishTerriers = () => {
  const setNotification = useSetRecoilState(notificationState);
  const [terriers, setTerriers] = useState<Terrier[]>([]);
  const [terriersLoading, setTerriersLoading] = useState(false);
  const [terrierDialogIsOpen, setTerrierDialogIsOpen] = useState(false);
  const [editTerrier, setEditTerrier] = useState<Terrier>();
  const [refreshTerriers, setRefreshTerriers] = useState(true);

  useEffect(() => {
    const fetchTerriers = async () => {
      setTerriersLoading(true);
      try {
        const querySnapshot = await getDocs(
          query(collection(db, "terriers"), orderBy("dateOfBirth", "asc"))
        );
        if (!querySnapshot.empty) {
          const newTerriers: Terrier[] = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
              let terrier = { ...doc.data(), id: doc.id } as Terrier;

              const imgRef = ref(storage, "images/terriers/" + doc.id);
              await getDownloadURL(imgRef)
                .then((link) => {
                  terrier = { ...terrier, imageUrl: link };
                })
                .catch((err) => {
                  if (!err.message.includes("storage/object-not-found")) throw Error(err);
                });

              return terrier;
            })
          );

          setTerriers(newTerriers);
        } else {
          setTerriers([]);
        }
      } catch (error) {
        console.error(error);
        setNotification({
          message: "Het is niet gelukt om een connectie met de database te maken",
          severity: "error",
        });
      }
      setTerriersLoading(false);
    };

    if (refreshTerriers) {
      setRefreshTerriers(false);
      fetchTerriers();
    }
  }, [refreshTerriers, setNotification]);

  const handdleOpenTerrierDialog = (terrier?: Terrier) => {
    if (terrier) setEditTerrier(terrier);
    setTerrierDialogIsOpen(true);
  };

  const handleCloseTerrierDialog = () => {
    setEditTerrier(undefined);
    setTerrierDialogIsOpen(false);
  };

  const handleTerriersEdited = () => {
    setRefreshTerriers(true);
  };

  return (
    <Page title="Ierse terriërs">
      <TextEditCard title="Introductietekst" identifier="intro" page="irishTerriers" />
      <CoverPhotosCard page="irishTerriers" />
      <AppCard title="De terriërs">
        {terriersLoading ? (
          <CircularProgress />
        ) : (
          <List className="list" dense>
            {terriers.map((terrier, i) => (
              <div key={terrier.id}>
                {i > 0 && <Divider />}
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handdleOpenTerrierDialog(terrier)}>
                    <ListItemAvatar>
                      {terrier.imageUrl ? (
                        <Avatar alt="img" src={terrier.imageUrl} />
                      ) : (
                        <Avatar>
                          <Pets />
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={terrier.name}
                      secondary={format(terrier.dateOfBirth.toDate(), "dd-MM-yyyy")}
                    />
                  </ListItemButton>
                </ListItem>
              </div>
            ))}
          </List>
        )}
        <div className="card-actions">
          <Button onClick={() => handdleOpenTerrierDialog()} variant="contained">
            Terriër toevoegen
          </Button>
        </div>
      </AppCard>
      <TerrierDialog
        open={terrierDialogIsOpen}
        onClose={handleCloseTerrierDialog}
        terrier={editTerrier}
        onEdited={handleTerriersEdited}
      />
    </Page>
  );
};
