import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../../services/notifications";
import { Button, CircularProgress, Typography } from "@mui/material";
import { Page } from "../../components/common/Page";
import { NewsitemDialog } from "./NewsitemDialog";
import { NewsitemList } from "./NewsitemList";
import { TextEditCard } from "../../components/common/TextEditCard";
import { AppCard } from "../../components/common/AppCard";
import { CoverPhotosCard } from "../../components/common/CoverPhotosCard";
import { Newsitem } from "../../models/news";
import { getAllNewsitems, getNewsitemsWithImageIds } from "../../services/newsService";

export const Home = () => {
  const setNotification = useSetRecoilState(notificationState);
  const [newsitems, setNewitems] = useState<Newsitem[]>([]);
  const [newsitemsWithImageIds, setNewsitemsWithImageIds] = useState<string[]>([]);
  const [newsitemsLoading, setNewitemsLoading] = useState(false);
  const [newsItemDialogIsOpen, setNewsItemDialogIsOpen] = useState(false);
  const [editNewsitem, setEditNewsitem] = useState<Newsitem | undefined>();
  const [refreshNewsitems, setRefreshNewsitems] = useState(true);

  useEffect(() => {
    const fetchNewsitems = async () => {
      setNewitemsLoading(true);
      try {
        const newNewsitemsWithImageIds = await getNewsitemsWithImageIds();
        const newNewsitems = await getAllNewsitems(newNewsitemsWithImageIds);
        setNewsitemsWithImageIds(newNewsitemsWithImageIds);
        setNewitems(newNewsitems);
      } catch (_) {
        setNotification({
          message: "Het is niet gelukt om een connectie met de database te maken",
          severity: "error",
        });
      }
      setNewitemsLoading(false);
    };

    if (refreshNewsitems) {
      setRefreshNewsitems(false);
      fetchNewsitems();
    }
  }, [refreshNewsitems, setNotification]);

  const handleOpenNewsItemDialog = () => {
    setNewsItemDialogIsOpen(true);
  };

  const handleCloseNewsItemDialog = () => {
    setEditNewsitem(undefined);
    setNewsItemDialogIsOpen(false);
  };

  const handleEditNewsitem = (newsitem: Newsitem) => {
    setEditNewsitem({ ...newsitem });
    setNewsItemDialogIsOpen(true);
  };

  const handleNewsitemsEdited = () => {
    setRefreshNewsitems(true);
  };

  return (
    <Page title="Home">
      <TextEditCard title="Introductietekst" identifier="intro" page="home" />
      <CoverPhotosCard page="home" />
      <AppCard title="Nieuwsitems">
        <Typography>Voeg een nieuwsitem toe, of klik op een item om het te bewerken.</Typography>
        {newsitemsLoading ? (
          <CircularProgress />
        ) : (
          <NewsitemList newsitems={newsitems} onEdit={handleEditNewsitem} />
        )}

        <div className="card-actions">
          <Button onClick={handleOpenNewsItemDialog} variant="contained">
            Nieuws item toevoegen
          </Button>
        </div>

        <NewsitemDialog
          open={newsItemDialogIsOpen}
          onClose={handleCloseNewsItemDialog}
          newsitemsWithImageIds={newsitemsWithImageIds}
          newsitem={editNewsitem}
          onEdited={handleNewsitemsEdited}
        />
      </AppCard>
    </Page>
  );
};
