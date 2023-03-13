import { validate } from "./validate";
import { oldPassword, password } from "./validators";

const schema = {
  oldPassword,
  password,
};

export const validateNewPassword = (input: {}) => validate(input, schema);
