// SQLite Database Service
import * as SQLite from 'expo-sqlite';
import { Transaction, Budget, Alert } from '../types';

const DB_NAME = 'finmate.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get or initialize database
 */
async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    return db;
  } catch (error) {
    console.error('❌ Error opening database:', error);
    throw error;
  }
}

/**
 * Initialize database and create tables
 */
export async function initDatabase(): Promise<void> {
  try {
    const database = await getDatabase();
    
    // Create all tables in a single transaction
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        merchant TEXT NOT NULL,
        upiId TEXT,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        status TEXT NOT NULL,
        bankAccount TEXT,
        upiRef TEXT,
        notes TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL UNIQUE,
        amount REAL NOT NULL,
        spent REAL DEFAULT 0,
        period TEXT NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        date TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        actionRequired INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        budget REAL
      );
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

/**
 * Transaction CRUD operations
 */
export const TransactionDB = {
  async create(transaction: Transaction): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      `INSERT INTO transactions (id, amount, type, merchant, upiId, category, date, time, status, bankAccount, upiRef, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.id,
        transaction.amount,
        transaction.type,
        transaction.merchant,
        transaction.upiId || null,
        transaction.category,
        transaction.date,
        transaction.time,
        transaction.status,
        transaction.bankAccount || null,
        transaction.upiRef || null,
        transaction.notes || null,
      ]
    );
  },

  async getAll(): Promise<Transaction[]> {
    const database = await getDatabase();
    
    const result = await database.getAllAsync<Transaction>(
      'SELECT * FROM transactions ORDER BY date DESC, time DESC'
    );
    return result;
  },

  async getById(id: string): Promise<Transaction | null> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<Transaction>(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );
    return result || null;
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const database = await getDatabase();
    
    const result = await database.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC',
      [startDate, endDate]
    );
    return result;
  },

  async getByCategory(category: string): Promise<Transaction[]> {
    const database = await getDatabase();
    
    const result = await database.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE category = ? ORDER BY date DESC',
      [category]
    );
    return result;
  },

  async update(id: string, updates: Partial<Transaction>): Promise<void> {
    const database = await getDatabase();
    
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];
    
    await database.runAsync(
      `UPDATE transactions SET ${fields} WHERE id = ?`,
      values
    );
  },

  async delete(id: string): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  },

  async deleteAll(): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync('DELETE FROM transactions');
  },

  async getTotalSpent(startDate: string, endDate: string): Promise<number> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<{ total: number }>(
      `SELECT SUM(amount) as total FROM transactions 
       WHERE type = 'sent' AND date BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    return result?.total || 0;
  },

  async getCategorySpending(category: string, startDate: string, endDate: string): Promise<number> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<{ total: number }>(
      `SELECT SUM(amount) as total FROM transactions 
       WHERE type = 'sent' AND category = ? AND date BETWEEN ? AND ?`,
      [category, startDate, endDate]
    );
    return result?.total || 0;
  },
};

/**
 * Budget CRUD operations
 */
export const BudgetDB = {
  async create(budget: Budget): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      `INSERT INTO budgets (id, category, amount, spent, period, startDate, endDate)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [budget.id, budget.category, budget.amount, budget.spent, budget.period, budget.startDate, budget.endDate]
    );
  },

  async getAll(): Promise<Budget[]> {
    const database = await getDatabase();
    
    try {
      const result = await database.getAllAsync<Budget>('SELECT * FROM budgets ORDER BY category');
      return result || [];
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }
  },

  async getByCategory(category: string): Promise<Budget | null> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<Budget>(
      'SELECT * FROM budgets WHERE category = ?',
      [category]
    );
    return result || null;
  },

  async update(id: string, updates: Partial<Budget>): Promise<void> {
    const database = await getDatabase();
    
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];
    
    await database.runAsync(
      `UPDATE budgets SET ${fields} WHERE id = ?`,
      values
    );
  },

  async updateSpent(category: string, amount: number): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      'UPDATE budgets SET spent = spent + ? WHERE category = ?',
      [amount, category]
    );
  },

  async delete(id: string): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync('DELETE FROM budgets WHERE id = ?', [id]);
  },

  async deleteAll(): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync('DELETE FROM budgets');
  },
};

/**
 * Alert CRUD operations
 */
export const AlertDB = {
  async create(alert: Alert): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      `INSERT INTO alerts (id, type, title, message, date, read, actionRequired)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [alert.id, alert.type, alert.title, alert.message, alert.date, alert.read ? 1 : 0, alert.actionRequired ? 1 : 0]
    );
  },

  async getAll(): Promise<Alert[]> {
    const database = await getDatabase();
    
    const result = await database.getAllAsync<Alert>('SELECT * FROM alerts ORDER BY date DESC');
    return result;
  },

  async markAsRead(id: string): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync('UPDATE alerts SET read = 1 WHERE id = ?', [id]);
  },

  async delete(id: string): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync('DELETE FROM alerts WHERE id = ?', [id]);
  },
};

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  const database = await getDatabase();
  
  await database.execAsync(`
    DELETE FROM transactions;
    DELETE FROM budgets;
    DELETE FROM alerts;
    DELETE FROM categories;
  `);
}
