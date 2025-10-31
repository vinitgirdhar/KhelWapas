import db from '../db';
import { randomUUID } from 'crypto';

export interface Product {
  id: string;
  name: string;
  category: string;
  type: 'new' | 'preowned';
  price: string;
  originalPrice: string | null;
  grade: 'A' | 'B' | 'C' | 'D' | null;
  imageUrls: string; // JSON string
  description: string;
  specs: string | null; // JSON string
  badge: string | null;
  isAvailable: number;
  createdAt: string;
  updatedAt: string;
}

export const productDAL = {
  findUnique: (where: { id: string }): Product | undefined => {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(where.id) as Product | undefined;
  },

  findMany: (options?: {
    where?: Partial<Product> & { 
      category?: string;
      type?: string;
      isAvailable?: boolean | number;
    };
    orderBy?: { [key: string]: 'asc' | 'desc' };
    take?: number;
    skip?: number;
    select?: { [key: string]: boolean };
  }): Product[] => {
    let query = 'SELECT * FROM products';
    const params: any[] = [];

    if (options?.where) {
      const conditions: string[] = [];
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'isAvailable' && typeof value === 'boolean') {
            conditions.push(`${key} = ?`);
            params.push(value ? 1 : 0);
          } else {
            conditions.push(`${key} = ?`);
            params.push(value);
          }
        }
      });
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
    }

    if (options?.orderBy) {
      const orderClauses = Object.entries(options.orderBy).map(
        ([key, direction]) => `${key} ${direction.toUpperCase()}`
      );
      query += ' ORDER BY ' + orderClauses.join(', ');
    }

    if (options?.take) {
      query += ` LIMIT ${options.take}`;
      if (options?.skip) {
        query += ` OFFSET ${options.skip}`;
      }
    }

    return db.prepare(query).all(...params) as Product[];
  },

  create: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO products (id, name, category, type, price, originalPrice, grade, imageUrls, description, specs, badge, isAvailable, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.name,
      data.category,
      data.type,
      data.price,
      data.originalPrice,
      data.grade,
      data.imageUrls,
      data.description,
      data.specs,
      data.badge,
      data.isAvailable,
      now,
      now
    );

    return productDAL.findUnique({ id })!;
  },

  update: (where: { id: string }, data: Partial<Omit<Product, 'id' | 'createdAt'>>): Product => {
    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'createdAt' && value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });

    updates.push('updatedAt = ?');
    params.push(new Date().toISOString());
    params.push(where.id);

    const stmt = db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return productDAL.findUnique(where)!;
  },

  delete: (where: { id: string }): void => {
    db.prepare('DELETE FROM products WHERE id = ?').run(where.id);
  },

  count: (where?: Partial<Product> & { isAvailable?: boolean | number }): number => {
    let query = 'SELECT COUNT(*) as count FROM products';
    const params: any[] = [];

    if (where) {
      const conditions: string[] = [];
      Object.entries(where).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'isAvailable' && typeof value === 'boolean') {
            conditions.push(`${key} = ?`);
            params.push(value ? 1 : 0);
          } else {
            conditions.push(`${key} = ?`);
            params.push(value);
          }
        }
      });
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
    }

    const result = db.prepare(query).get(...params) as { count: number };
    return result.count;
  },
};
