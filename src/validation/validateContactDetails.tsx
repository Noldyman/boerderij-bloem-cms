import { validate } from "./validate";
import { contacts, address, postalCode, city, phoneNumber, email } from "./validators";

const schema = {
  contacts,
  address,
  postalCode,
  city,
  phoneNumber,
  email,
};

export const validateContactDetails = (input: {}) => validate(input, schema);
