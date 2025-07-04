import { PrismaClient } from "./generated/prisma/client.js";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import houseRoutes from "./routes/houseRoutes.js";
import { login } from "./controllers/authController.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// const corsOptions = {
//   origin: function (origin, callback) {
//     const allowedOrigins = [
//       "http://localhost:3000",
//       "https://real-estate-project-client-iota.vercel.app"
//     ];

//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   exposedHeaders: ["Set-Cookie"]
// };






app.use(cors());
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