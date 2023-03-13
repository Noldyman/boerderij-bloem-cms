import { validate } from "./validate";
import { email } from "./validators";

const schema = {
  email,
};

export const validateEmail = (input: {}) => validate(input, schema);
