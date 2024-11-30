import express from "express";
import dotenv from "dotenv";
import { createClient } from "redis";

export const client = createClient();
const app = express();

client.on("error", (err) => {
  console.log("Redis Client Error", err);
});

app.use(express.json());

async function connectToRedis() {
  try {
    await client.connect();
    console.log("Connected!");
  } catch (err) {
    console.error("Error connecting to Redis:", err);
  }
}

connectToRedis();

import userRoute from "./routes/userRoute.js";

app.use("/user", userRoute);

app.listen(3000);
