import express from "express";
const router = express.Router();

import { registerUser } from "../controllers/userController";

router.post('/signup', registerUser)

export default router;