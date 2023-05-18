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
  Typography,
} from "@mui/material";
import { AppCard } from "../common/AppCard";
import { Dog } from "../../models/dogKennel";
import { Pets } from "@mui/icons-material";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { DogDialog } from "./DogDialog";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../services/notifications";
import { getAllDogs } from "../../services/dogService";

interface Props {
  title: string;
  directory: string;
}

export const DogKennel = ({ title, directory }: Props) => {
  const setNotification = useSetRecoilState(notificationState);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(false);
  const [dogDialogIsOpen, setDogDialogIsOpen] = useState(false);
  const [editDog, setEditDog] = useState<Dog>();
  const [refreshDogs, setRefreshDogs] = useState(true);

  useEffect(() => {
    const fetchDogs = async () => {
      setLoading(true);
      try {
        const newDogs = await getAllDogs(directory);
        setDogs(newDogs);
      } catch (_) {
        setNotification({
          message: "Het is niet gelukt om een connectie met de database te maken",
          severity: "error",
        });
      }
      setLoading(false);
    };

    if (refreshDogs) {
      setRefreshDogs(false);
      fetchDogs();
    }
  }, [refreshDogs, setNotification, directory]);

  const handleOpenDogDialog = (dog?: Dog) => {
    if (dog) setEditDog(dog);
    setDogDialogIsOpen(true);
  };

  const handleCloseDogDialog = () => {
    setEditDog(undefined);
    setDogDialogIsOpen(false);
  };

  const handleDogsEdited = () => {
    setRefreshDogs(true);
  };

  return (
    <AppCard title={title}>
      {loading ? (
        <CircularProgress />
      ) : dogs.length < 1 ? (
        <Typography fontStyle="italic">Je hebt nog geen honden toegevoegd</Typography>
      ) : (
        <List className="list" dense>
          {dogs.map((dog, i) => (
            <div key={dog.id}>
              {i > 0 && <Divider />}
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleOpenDogDialog(dog)}>
                  <ListItemAvatar>
                    {dog.imageUrl ? (
                      <Avatar alt="img" src={dog.imageUrl} />
                    ) : (
                      <Avatar>
                        <Pets />
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={dog.name}
                    secondary={format(dog.dateOfBirth.toDate(), "dd-MM-yyyy")}
                  />
                </ListItemButton>
              </ListItem>
            </div>
          ))}
        </List>
      )}
      <div className="card-actions">
        <Button onClick={() => handleOpenDogDialog()} variant="contained">
          Hond toevoegen
        </Button>
      </div>
      <DogDialog
        open={dogDialogIsOpen}
        onClose={handleCloseDogDialog}
        dog={editDog}
        onEdited={handleDogsEdited}
        directory={directory}
      />
    </AppCard>
  );
};
