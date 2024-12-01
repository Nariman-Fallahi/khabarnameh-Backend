import express from "express";
const router = express.Router();

import { registerUser } from "../controllers/userController";
import { generateAccessToken } from "../controllers/userController";

router.post("/signup", registerUser);

router.post("/refresh-token", generateAccessToken);

export default router;
