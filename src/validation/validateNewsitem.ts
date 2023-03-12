import { validate } from "./validate";
import { newsitemTitle, date, newsitemMessage } from "./validators";

const schema = {
  title: newsitemTitle,
  date: date,
  message: newsitemMessage,
};

export const validateNewsitem = (input: {}) => validate(input, schema);
