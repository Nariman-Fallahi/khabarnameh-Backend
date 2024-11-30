import Joi from "joi";

export const userRegistrationSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  createdAt: Joi.date().default(() => new Date()),
});
