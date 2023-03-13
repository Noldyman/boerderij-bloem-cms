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
