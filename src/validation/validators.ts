import * as yup from "yup";

export const email = yup
  .string()
  .email("Dit is geen geldig email adres")
  .max(100, "Max 100 karakters toegestaan")
  .required("Email adres is verplicht");

export const password = yup
  .string()
  .matches(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    "Moet minimaal een kleine letter, een hoofdletter, een nummer en een speciaal teken bevatten"
  )
  .min(8, "Minimaal 8 karakters vereist")
  .max(50, "Max 50 karakters toegestaan")
  .required("Wachtwoord is verplicht");

export const oldPassword = yup
  .string()
  .max(50, "Max 50 karakters toegestaan")
  .required("Wachtwoord is verplicht");

export const date = yup
  .date()
  .typeError("Dit is geen geldige datum")
  .required("Datum is verplicht");

export const newsitemTitle = yup
  .string()
  .max(50, "Max 50 karakters toegestaan")
  .required("Titel is verplicht");

export const newsitemMessage = yup
  .string()
  .max(1500, "Max 1500 karakters toegestaan")
  .required("Nieuwsbericht is verplicht");

export const contacts = yup
  .string()
  .max(50, "Max 50 karakters toegestaan")
  .required("Contactpersonen is verplicht");

export const address = yup
  .string()
  .max(50, "Max 50 karakters toegestaan")
  .matches(
    /^[A-Za-z\s]+\s[0-9]+$/,
    'Dit is geen geldige postcode, gebruik dit format: "Straatnaam nummer"'
  )
  .required("Straat en huisnummer is verplicht");

export const postalCode = yup
  .string()
  .matches(/^[0-9]{4} [A-Z]{2}$/, 'Dit is geen geldige postcode, gebruik dit format: "1234 AA"')
  .required("Postcode is verplicht");

export const city = yup
  .string()
  .max(30, "Max 30 karakters toegestaan")
  .required("Woonplaats is verplicht");

export const phoneNumber = yup
  .string()
  .matches(
    /\+316\s?[0-9]{8}$/,
    'Dits is geen geldig telefoonnummer, gebruik dit format: "+316 12345678"'
  )
  .required("Telefoonnummer is verplicht");
