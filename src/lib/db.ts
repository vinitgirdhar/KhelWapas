import Database from 'better-sqlite3';
import { join } from 'path';

// Initialize database
const dbPath = join(process.cwd(), 'database.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      profilePicture TEXT,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      status TEXT NOT NULL DEFAULT 'Active',
      rating INTEGER NOT NULL DEFAULT 5,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_createdAt ON users(createdAt);
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      price TEXT NOT NULL,
      originalPrice TEXT,
      grade TEXT,
      imageUrls TEXT NOT NULL,
      description TEXT NOT NULL,
      specs TEXT,
      badge TEXT,
      isAvailable INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
    CREATE INDEX IF NOT EXISTS idx_products_isAvailable ON products(isAvailable);
    CREATE INDEX IF NOT EXISTS idx_products_createdAt ON products(createdAt);
    CREATE INDEX IF NOT EXISTS idx_products_category_type_available ON products(category, type, isAvailable);
  `);

  // Sell Requests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sell_requests (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price TEXT NOT NULL,
      contactMethod TEXT NOT NULL,
      contactDetail TEXT,
      imageUrls TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_sell_requests_userId ON sell_requests(userId);
    CREATE INDEX IF NOT EXISTS idx_sell_requests_status ON sell_requests(status);
    CREATE INDEX IF NOT EXISTS idx_sell_requests_createdAt ON sell_requests(createdAt);
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      items TEXT NOT NULL,
      totalPrice TEXT NOT NULL,
      paymentStatus TEXT NOT NULL,
      fulfillmentStatus TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_orders_userId ON orders(userId);
    CREATE INDEX IF NOT EXISTS idx_orders_paymentStatus ON orders(paymentStatus);
    CREATE INDEX IF NOT EXISTS idx_orders_fulfillmentStatus ON orders(fulfillmentStatus);
    CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON orders(createdAt);
    CREATE INDEX IF NOT EXISTS idx_orders_userId_paymentStatus ON orders(userId, paymentStatus);
    CREATE INDEX IF NOT EXISTS idx_orders_paymentStatus_createdAt ON orders(paymentStatus, createdAt);
  `);

  // Addresses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      fullName TEXT NOT NULL,
      phone TEXT NOT NULL,
      street TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      postalCode TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'India',
      isDefault INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_addresses_userId ON addresses(userId);
    CREATE INDEX IF NOT EXISTS idx_addresses_userId_isDefault ON addresses(userId, isDefault);
  `);

  // Payment Methods table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_methods (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      cardLast4 TEXT,
      cardType TEXT,
      cardHolder TEXT,
      expiryMonth INTEGER,
      expiryYear INTEGER,
      upiId TEXT,
      nickname TEXT,
      isDefault INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_payment_methods_userId ON payment_methods(userId);
  `);

  // Reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      productId TEXT NOT NULL,
      userId TEXT NOT NULL,
      reviewerName TEXT NOT NULL,
      reviewerImage TEXT,
      FOREIGN KEY (productId) REFERENCES products(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_productId ON reviews(productId);
    CREATE INDEX IF NOT EXISTS idx_reviews_userId ON reviews(userId);
    CREATE INDEX IF NOT EXISTS idx_reviews_createdAt ON reviews(createdAt);
  `);

  console.log('✅ Database schema initialized');
}

export default db;
