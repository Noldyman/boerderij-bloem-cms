import { validate } from "./validate";
import { terrierName, date, terrierDescription } from "./validators";

const schema = {
  name: terrierName,
  dateOfBirth: date,
  description: terrierDescription,
};

export const validateTerrier = (input: {}) => validate(input, schema);
