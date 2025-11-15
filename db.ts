import * as SQLite from "expo-sqlite";
import { initTable, seedSampleGroceries } from "@/dbs";

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Opens the SQLite database connection and initializes the schema.
 * Seeds sample data if the table is empty.
 */
export const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) {
    return db;
  }

  try {
    // Open the database (creates it if it doesn't exist)
    db = await SQLite.openDatabaseAsync("grocery.db");

    // Initialize table schema
    await initTable(db);

    // Seed sample data if table is empty
    await seedSampleGroceries(db);

    console.log("✅ Database opened and initialized successfully");
    return db;
  } catch (error) {
    console.error("❌ Error opening database:", error);
    throw error;
  }
};

/**
 * Returns the current database instance (must call openDatabase first).
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!db) {
    throw new Error("Database not initialized. Call openDatabase() first.");
  }
  return db;
};

/**
 * Closes the database connection (optional, usually not needed in React Native).
 */
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
    console.log("Database closed");
  }
};
