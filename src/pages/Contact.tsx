import { ChangeEvent, useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { notificationState } from "../services/notifications";
import { Page } from "../components/common/Page";
import { AppCard } from "../components/common/AppCard";
import { TextEditCard } from "../components/common/TextEditCard";
import { Button, TextField } from "@mui/material";
import { validateContactDetails } from "../validation/validateContactDetails";
import { CoverPhotosCard } from "../components/common/CoverPhotosCard";
import { ContactDetails } from "../models/contact";
import {
  createContactDetails,
  getContactInfo,
  updateContactDetails,
} from "../services/contactService";

interface Errors {
  [key: string]: string;
}

const initialContactDetails = {
  contacts: "",
  address: "",
  postalCode: "",
  city: "",
  phoneNumber: "",
  email: "",
};
export const Contact = () => {
  const setNotification = useSetRecoilState(notificationState);
  const [contactDetails, setContactDetails] = useState<ContactDetails>(initialContactDetails);
  const [errors, setErrors] = useState<Errors | undefined>();
  const [loading, setLoading] = useState(false);
  const [detailsDocId, setDetailsDocId] = useState("");

  useEffect(() => {
    const fetchContactDetails = async () => {
      try {
        const response = await getContactInfo();
        if (response) {
          setDetailsDocId(response.id);
          setContactDetails({ ...response.details });
        }
      } catch (_) {
        setNotification({
          message: "Het is niet gelukt om een connectie met de database te maken",
          severity: "error",
        });
      }
    };
    fetchContactDetails();
  }, [setNotification]);

  const handleChangeContactDetails = (e: ChangeEvent<HTMLInputElement>) => {
    setContactDetails((prevValue) => ({ ...prevValue, [e.target.name]: e.target.value }));
  };

  const handleSubmitContactDetails = async () => {
    setLoading(true);
    setErrors(undefined);
    const errors = await validateContactDetails({
      ...contactDetails,
    });
    if (errors) {
      setLoading(false);
      return setErrors(errors);
    }
    try {
      if (detailsDocId) {
        await updateContactDetails(detailsDocId, contactDetails);
      } else {
        const newId = await createContactDetails(contactDetails);
        setDetailsDocId(newId);
      }
      setNotification({ message: "De contactgegevens zijn opgeslagen", severity: "success" });
    } catch (_) {
      setNotification({
        message: "Het is niet gelukt om de contactgegevens op te slaan",
        severity: "error",
      });
    }
    setLoading(false);
  };

  return (
    <Page title="Contact">
      <TextEditCard title="Introductietekst" page="contact" identifier="intro" />
      <CoverPhotosCard page="contact" />
      <AppCard title="Contactgegevens">
        <div className="small-card-content">
          <TextField
            size="small"
            name="contacts"
            label="Contactpersonen"
            value={contactDetails.contacts}
            onChange={handleChangeContactDetails}
            error={Boolean(errors && errors["contacts"])}
            helperText={errors && errors["contacts"]}
          />
          <TextField
            size="small"
            name="address"
            label="Straat en huisnummer"
            value={contactDetails.address}
            onChange={handleChangeContactDetails}
            error={Boolean(errors && errors["address"])}
            helperText={errors && errors["address"]}
          />
          <TextField
            size="small"
            name="postalCode"
            label="Postcode"
            value={contactDetails.postalCode}
            onChange={handleChangeContactDetails}
            error={Boolean(errors && errors["postalCode"])}
            helperText={errors && errors["postalCode"]}
          />
          <TextField
            size="small"
            name="city"
            label="Woonplaats"
            value={contactDetails.city}
            onChange={handleChangeContactDetails}
            error={Boolean(errors && errors["city"])}
            helperText={errors && errors["city"]}
          />
          <TextField
            size="small"
            name="phoneNumber"
            label="Telefoonnummer"
            value={contactDetails.phoneNumber}
            onChange={handleChangeContactDetails}
            error={Boolean(errors && errors["phoneNumber"])}
            helperText={errors && errors["phoneNumber"]}
          />
          <TextField
            size="small"
            name="email"
            label="Email adres"
            value={contactDetails.email}
            onChange={handleChangeContactDetails}
            error={Boolean(errors && errors["email"])}
            helperText={errors && errors["email"]}
          />
          <div className="card-actions">
            <Button disabled={loading} onClick={handleSubmitContactDetails} variant="contained">
              Opslaan
            </Button>
          </div>
        </div>
      </AppCard>
    </Page>
  );
};
