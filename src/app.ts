import express from "express";
import { Request, Response } from "express";
import { initializeDatabase } from "./config/database";
import identityRoutes from "./routes/identityRoutes";
import cors from "cors";
import { AppDataSource } from "./config/database";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/", identityRoutes);

// In your app.ts
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK',
    db: AppDataSource.isInitialized ? 'connected' : 'disconnected'
  });
});


const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();