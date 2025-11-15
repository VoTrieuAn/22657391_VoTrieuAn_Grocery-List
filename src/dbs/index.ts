import { Transaction } from "@/types/transaction.type";
import { SQLiteDatabase } from "expo-sqlite";

export const initTable = async (db: SQLiteDatabase) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT CHECK( type IN ('INCOME','EXPENSE')) NOT NULL,
      deleted INTEGER DEFAULT 0
    );
  `);
};

// CREATE
export const createTransaction = async (
  db: SQLiteDatabase,
  data: Transaction
) => {
  await db.runAsync(
    `
      INSERT INTO transactions (title, amount, type)
      VALUES (?, ?, ?);
    `,
    [data.title, data.amount, data.type]
  );
};
// READ
export const getAllTransactions = async (db: SQLiteDatabase, isDeleted = 0) => {
  return await db.getAllAsync<Transaction>(
    `SELECT * FROM transactions WHERE deleted = ?;`,
    [isDeleted]
  );
};

export const getTransactionsById = async (db: SQLiteDatabase, id: number) => {
  return await db.getFirstAsync<Transaction>(
    `SELECT * FROM transactions WHERE id = ?;`,
    [id]
  );
};
// UPDATE
export const updateTransaction = async (
  db: SQLiteDatabase,
  data: Transaction
) => {
  await db.runAsync(
    `
      UPDATE transactions SET title = ?, amount = ?, type = ?
      WHERE id = ?;
    `,
    [data.title, data.amount, data.type, data.id]
  );
};

// DELETE (Soft Delete)
export const deleteTransaction = async (db: SQLiteDatabase, id: number) => {
  await db.runAsync(
    `
      UPDATE transactions SET deleted = 1
      WHERE id = ?;
    `,
    [id]
  );
};

// RESTORE
export const restoreTransaction = async (db: SQLiteDatabase, id: number) => {
  await db.runAsync(
    `
      UPDATE transactions SET deleted = 0
      WHERE id = ?;
    `,
    [id]
  );
};
