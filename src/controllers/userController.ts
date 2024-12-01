import e, { Request, Response } from "express";
import { userRegistrationSchema } from "../schemas/userSchema";
import bcrypt from "bcryptjs";
import { client } from "../server";
import { generateToken, verifyToken } from "../utils/token";
import { JwtPayload } from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response) => {
  const userData = req.body;

  const { error, value } = userRegistrationSchema.validate(userData);

  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);

  if (error || !value) {
    res.status(400).json({
      message: "Invalid data",
      error: error?.message,
    });
  } else {
    try {
      const existsEmail = await client.SISMEMBER("emails", userData.email);

      if (existsEmail) {
        res.status(400).json({
          message: "Email already exists",
        });
      } else {
        const userId = await client.INCR("USER_ID");
        value.id = userId;

        client.SADD("emails", value.email);

        const hashedPassword = await bcrypt.hash(value.password, salt);
        value.password = hashedPassword;

        const accessToken = generateToken(value, "1h");

        const refreshToken = generateToken(value, "7d");

        await client.SET(`user:${value.id}`, JSON.stringify(value));
        await client.SETEX(
          `user:${value.id}:refreshToken`,
          7 * 24 * 60 * 60,
          refreshToken
        );

        res.status(201).json({
          message: "User registered successfully",
          id: value.id,
          accessToken,
          refreshToken,
        });
      }
    } catch (err) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

export const userLogin = async (req: Request, res: Response) => {};

export const generateAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const decoded = verifyToken(refreshToken) as JwtPayload;
    const { exp, ...payloadWithoutExp } = decoded;

    const value = await client.get(`user:${decoded.id}:refreshToken`);

    if (value !== refreshToken) {
      res.status(403).send("Invalid Refresh Token");
    } else {
      const newAccessToken = generateToken(payloadWithoutExp, "1h");
      res.status(200).json({ accessToken: newAccessToken });
    }
  }
};
