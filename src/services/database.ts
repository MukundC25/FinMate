// SQLite Database Service
import * as SQLite from 'expo-sqlite';
import { Transaction, Budget, Alert } from '../types';

const DB_NAME = 'finmate.db';
const DB_VERSION = 2; // Increment this when schema changes

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
 * Check if database needs migration
 */
async function needsMigration(database: SQLite.SQLiteDatabase): Promise<boolean> {
  try {
    // Try to get a column from the new schema
    const result = await database.getFirstAsync(
      "SELECT userId FROM transactions LIMIT 1"
    );
    return false; // Column exists, no migration needed
  } catch (error) {
    return true; // Column doesn't exist, need migration
  }
}

/**
 * Drop all tables for fresh start
 */
async function dropAllTables(database: SQLite.SQLiteDatabase): Promise<void> {
  console.log('🗑️ Dropping old tables...');
  await database.execAsync(`
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS budgets;
    DROP TABLE IF EXISTS alerts;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS bank_accounts;
  `);
  console.log('✅ Old tables dropped');
}

/**
 * Initialize database and create tables
 */
export async function initDatabase(): Promise<void> {
  try {
    const database = await getDatabase();
    
    // Check if migration is needed
    const shouldMigrate = await needsMigration(database);
    
    if (shouldMigrate) {
      console.log('⚠️ Database schema changed, recreating tables...');
      await dropAllTables(database);
    }
    
    // Create all tables in a single transaction
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        name TEXT NOT NULL,
        loginMethod TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
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
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        spent REAL DEFAULT 0,
        period TEXT NOT NULL,
        startDate TEXT NOT NULL,
        endDate TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        UNIQUE(userId, category)
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        date TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        actionRequired INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        budget REAL
      );
      
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        bankName TEXT NOT NULL,
        accountNumber TEXT NOT NULL,
        accountHolderName TEXT NOT NULL,
        status TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
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
  async create(transaction: Transaction & { userId: string }): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      `INSERT INTO transactions (id, userId, amount, type, merchant, upiId, category, date, time, status, bankAccount, upiRef, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.id,
        transaction.userId,
        transaction.amount,
        transaction.type,
        transaction.merchant,
        transaction.upiId || '',
        transaction.category,
        transaction.date,
        transaction.time,
        transaction.status,
        transaction.bankAccount || '',
        transaction.upiRef || '',
        transaction.notes || '',
      ]
    );
  },

  async getAll(userId: string): Promise<Transaction[]> {
    const database = await getDatabase();
    
    const result = await database.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC, time DESC',
      [userId]
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

  async getByDateRange(userId: string, startDate: string, endDate: string): Promise<Transaction[]> {
    const database = await getDatabase();
    
    const result = await database.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE userId = ? AND date BETWEEN ? AND ? ORDER BY date DESC',
      [userId, startDate, endDate]
    );
    return result;
  },

  async getByCategory(userId: string, category: string): Promise<Transaction[]> {
    const database = await getDatabase();
    
    const result = await database.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE userId = ? AND category = ? ORDER BY date DESC',
      [userId, category]
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

  async getTotalSpent(startDate: string, endDate: string, userId: string): Promise<number> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<{ total: number }>(
      `SELECT SUM(amount) as total FROM transactions 
       WHERE userId = ? AND type = 'sent' AND date BETWEEN ? AND ?`,
      [userId, startDate, endDate]
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
  async create(budget: Budget & { userId: string }): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      `INSERT INTO budgets (id, userId, category, amount, spent, period, startDate, endDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [budget.id, budget.userId, budget.category, budget.amount, budget.spent, budget.period, budget.startDate, budget.endDate]
    );
  },

  async getAll(userId: string): Promise<Budget[]> {
    const database = await getDatabase();
    
    try {
      const result = await database.getAllAsync<Budget>(
        'SELECT * FROM budgets WHERE userId = ? ORDER BY category',
        [userId]
      );
      return result || [];
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }
  },

  async getByCategory(userId: string, category: string): Promise<Budget | null> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<Budget>(
      'SELECT * FROM budgets WHERE userId = ? AND category = ?',
      [userId, category]
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

  async updateSpent(userId: string, category: string, amount: number): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      'UPDATE budgets SET spent = spent + ? WHERE userId = ? AND category = ?',
      [amount, userId, category]
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
 * User CRUD operations
 */
export const UserDB = {
  async create(user: { id: string; email?: string; name: string; loginMethod: string }): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      `INSERT OR REPLACE INTO users (id, email, name, loginMethod)
       VALUES (?, ?, ?, ?)`,
      [user.id, user.email || null, user.name, user.loginMethod]
    );
  },

  async getById(id: string): Promise<any | null> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<any>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return result || null;
  },

  async getByEmail(email: string): Promise<any | null> {
    const database = await getDatabase();
    
    const result = await database.getFirstAsync<any>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return result || null;
  },

  async update(id: string, updates: { name?: string; email?: string }): Promise<void> {
    const database = await getDatabase();
    
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];
    
    await database.runAsync(
      `UPDATE users SET ${fields} WHERE id = ?`,
      values
    );
  },
};

/**
 * Bank Account CRUD operations
 */
export const BankAccountDB = {
  async create(account: { id: string; userId: string; bankName: string; accountNumber: string; accountHolderName: string; status: string }): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync(
      `INSERT INTO bank_accounts (id, userId, bankName, accountNumber, accountHolderName, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [account.id, account.userId, account.bankName, account.accountNumber, account.accountHolderName, account.status]
    );
  },

  async getAllByUser(userId: string): Promise<any[]> {
    const database = await getDatabase();
    
    const result = await database.getAllAsync<any>(
      'SELECT * FROM bank_accounts WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    return result;
  },

  async update(id: string, updates: { status?: string; bankName?: string }): Promise<void> {
    const database = await getDatabase();
    
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(updates), id];
    
    await database.runAsync(
      `UPDATE bank_accounts SET ${fields} WHERE id = ?`,
      values
    );
  },

  async delete(id: string): Promise<void> {
    const database = await getDatabase();
    
    await database.runAsync('DELETE FROM bank_accounts WHERE id = ?', [id]);
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
