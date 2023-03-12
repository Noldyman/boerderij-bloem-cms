import { object, ValidationError } from "yup";

type obj = { [k: string]: string };

export const validate = async (input: {}, schema: {}) => {
  let errors: obj = {};

  try {
    await object(schema).validate(input, { abortEarly: false });
  } catch (err: any) {
    err.inner.forEach((e: ValidationError) => {
      errors[e.path!] = e.message;
    });
  }
  return Object.keys(errors).length ? errors : null;
};
