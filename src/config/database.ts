import "reflect-metadata";
import { DataSource } from "typeorm";
import { Contact } from "../models/contact.model";

const isUsingUrl = !!process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL, // Use full connection URL
  // OR separately:
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
    
  
  logging: false,
  entities: [Contact],
  extra: {
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20,
  },
  migrations: ["dist/migrations/*.js"],
  migrationsRun: true,
  
  migrationsTableName: "migrations",
  synchronize: false,
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
        await new Promise((res) => setTimeout(res, 5000));
      }
    }
  }

  console.error("💥 Failed to connect to database after multiple attempts");
  process.exit(1);
};
