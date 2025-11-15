import { Grocery } from "@/types/grocery.type";
import { SQLiteDatabase } from "expo-sqlite";

export const initTable = async (db: SQLiteDatabase) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS grocery_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      category TEXT,
      bought INTEGER DEFAULT 0,
      created_at INTEGER
    );
  `);
};

// CREATE
export const createGrocery = async (db: SQLiteDatabase, data: Grocery) => {
  await db.runAsync(
    `
      INSERT INTO grocery_items (name, quantity, category, bought, created_at)
      VALUES (?, ?, ?, ?, ?);
    `,
    [
      data.name,
      data.quantity,
      data.category,
      data.bought ? 1 : 0,
      data.created_at.getTime(),
    ]
  );
};
// READ
export const getAllGrocery = async (db: SQLiteDatabase) => {
  return await db.getAllAsync<Grocery>(`SELECT * FROM grocery_items`);
};

export const getGroceryById = async (db: SQLiteDatabase, id: number) => {
  return await db.getFirstAsync<Grocery>(
    `SELECT * FROM grocery_items WHERE id = ?;`,
    [id]
  );
};
// UPDATE
export const updateGrocery = async (db: SQLiteDatabase, data: Grocery) => {
  await db.runAsync(
    `
      UPDATE grocery_items SET name = ?, quantity = ?, category = ?, bought = ?
      WHERE id = ?;
    `,
    [data.name, data.quantity, data.category, data.bought ? 1 : 0, data.id]
  );
};

// Optional: seed the table with sample items if it's empty.
export const seedSampleGroceries = async (db: SQLiteDatabase) => {
  // Check number of rows in table
  const countRow = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM grocery_items;`
  );

  const count = countRow?.count ?? 0;
  if (count === 0) {
    const samples: Grocery[] = [
      {
        id: 0,
        name: "Sữa",
        quantity: 1,
        category: "Dairy",
        bought: false,
        created_at: new Date(),
      },
      {
        id: 0,
        name: "Trứng",
        quantity: 12,
        category: "Protein",
        bought: false,
        created_at: new Date(),
      },
      {
        id: 0,
        name: "Bánh mì",
        quantity: 1,
        category: "Bakery",
        bought: false,
        created_at: new Date(),
      },
    ];

    for (const item of samples) {
      // createGrocery expects a Grocery; id is ignored by the INSERT
      // await each insert to keep ordering predictable
      await createGrocery(db, item);
    }
  }
};

// // DELETE (Soft Delete)
// export const deleteTransaction = async (db: SQLiteDatabase, id: number) => {
//   await db.runAsync(
//     `
//       UPDATE transactions SET deleted = 1
//       WHERE id = ?;
//     `,
//     [id]
//   );
// };

// // RESTORE
// export const restoreTransaction = async (db: SQLiteDatabase, id: number) => {
//   await db.runAsync(
//     `
//       UPDATE transactions SET deleted = 0
//       WHERE id = ?;
//     `,
//     [id]
//   );
// };
