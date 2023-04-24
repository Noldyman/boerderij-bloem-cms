import { useEffect, useState } from "react";
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
import { IntroTextCard } from "../../components/common/IntroTextCard";
import { CoverPhotosCard } from "../../components/common/CoverPhotosCard";
import { TerrierDialog } from "./TerrierDialog";
import { Terrier } from "../../models/irishTerriers";
import { format } from "date-fns";
import { getAllTerriers } from "../../services/irishTerrierService";
import { SiteInformation } from "../../components/common/siteInformation/SiteInformation";

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
        const newTerriers = await getAllTerriers();
        setTerriers(newTerriers);
      } catch (_) {
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
      <IntroTextCard page="irishTerriers" />
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
      <SiteInformation page="irishTerriers" />
      <TerrierDialog
        open={terrierDialogIsOpen}
        onClose={handleCloseTerrierDialog}
        terrier={editTerrier}
        onEdited={handleTerriersEdited}
      />
    </Page>
  );
};
