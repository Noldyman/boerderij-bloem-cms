import * as yup from "yup";

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
