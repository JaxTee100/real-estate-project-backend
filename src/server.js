import { PrismaClient } from "./generated/prisma/client.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import houseRoutes from "./routes/houseRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? true 
    : ['https://real-estate-project-client-e7t0qim6u-tobias-projects-16beace5.vercel.app/'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

export const prisma = new PrismaClient();

app.use("/api/auth", authRoutes);
app.use("/api/house", houseRoutes);

app.get("/", (req, res) => {
  res.send("Hello Real Estate backend");
});

app.listen(PORT, () => {
  console.log(`Server is now running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});