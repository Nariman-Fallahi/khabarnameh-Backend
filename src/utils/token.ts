import jwt, { JwtPayload } from "jsonwebtoken";
import fs from "fs";

const privateKey = fs.readFileSync("private.key", "utf8");

export const generateToken = (value: JwtPayload, expiresIn: string) => {
  return jwt.sign(value, privateKey, {
    expiresIn: expiresIn,
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, privateKey);
};
