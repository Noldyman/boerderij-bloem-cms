import { validate } from "./validate";
import { dogName, date, terrierDescription } from "./validators";

const schema = {
  name: dogName,
  dateOfBirth: date,
  description: terrierDescription,
};

export const validateDog = (input: {}) => validate(input, schema);
