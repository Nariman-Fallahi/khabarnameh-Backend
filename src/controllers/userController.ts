import { Request, Response } from "express";
import { userRegistrationSchema } from "../schemas/userSchema";
import bcrypt from "bcryptjs";
import { client } from "../server";

export const registerUser = async (req: Request, res: Response) => {
  const userData = req.body;

  const { error, value } = userRegistrationSchema.validate(userData);

  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const userId = await client.incr("user:id");

  if (error || !value) {
    res.status(400).json({
      message: "Invalid data",
      error: error?.message,
    });
  } else {
    try {
      value.email = value.email.toLowerCase();
      const existingUserId = await client.exists(`user:${value.email}`);

      if (existingUserId) {
        res.status(400).json({
          message: "Email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(value.password, salt);
      value.password = hashedPassword;
      value.id = userId;

      await client.set(`user:${value.email}`, JSON.stringify(value));

      res.status(201).json({
        message: "User registered successfully",
        userId,
      });
    } catch (err) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};
