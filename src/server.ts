import express, { type Request, type Response } from "express";
import cors from "cors";
import { connectDB } from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import borrowerRoutes from "./routes/borrowerRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { setupSwagger } from "./config/swagger.js";
import trackRoutes from "./routes/trackRoutes.js";

const app = express();

const allowedOrigins = [
  "https://www.truefin.tech",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.get("/test-docs", (_req, res) => res.send("test works"));

app.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "TruFin Installment Tracker API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/borrowers", borrowerRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/track", trackRoutes);

setupSwagger(app);

app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

connectDB();

export default app;
