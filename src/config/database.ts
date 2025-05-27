import "reflect-metadata";
import { DataSource } from "typeorm";
import { Contact } from "../models/contact.model";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "bitespeed",
  synchronize: false,
  logging: false, // Disable query logging for cleaner output
  entities: [Contact], // Direct entity import instead of glob pattern
  extra: {
    connectionTimeoutMillis: 30000, // Increased timeout
    idleTimeoutMillis: 30000,
    max: 20
  },
  migrations: ["dist/migrations/*.js"],
  migrationsRun: true, // Enable automatic migrations
  migrationsTableName: "migrations"
});

export const initializeDatabase = async () => {
  const maxRetries = 10;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      console.log(`Attempting database connection (attempt ${retries + 1}/${maxRetries})...`);
      await AppDataSource.initialize();
      console.log("✅ Database connection established successfully");
      return;
    } catch (error) {
      retries++;
      console.log(`❌ Database connection failed (attempt ${retries}/${maxRetries}):`, error instanceof Error ? error.message : error);
      
      if (retries < maxRetries) {
        console.log("⏳ Waiting 5 seconds before retry...");
        await new Promise(res => setTimeout(res, 5000));
      }
    }
  }
  
  console.error("💥 Failed to connect to database after multiple attempts");
  process.exit(1);
};