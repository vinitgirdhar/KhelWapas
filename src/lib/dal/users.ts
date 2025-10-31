import db from '../db';
import { randomUUID } from 'crypto';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  profilePicture: string | null;
  passwordHash: string;
  role: 'user' | 'admin';
  status: 'Active' | 'Blocked' | 'Pending';
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export const userDAL = {
  findUnique: (where: { id?: string; email?: string }): User | undefined => {
    if (where.id) {
      return db.prepare('SELECT * FROM users WHERE id = ?').get(where.id) as User | undefined;
    }
    if (where.email) {
      return db.prepare('SELECT * FROM users WHERE email = ?').get(where.email) as User | undefined;
    }
    return undefined;
  },

  findMany: (options?: {
    where?: Partial<User>;
    orderBy?: { [key: string]: 'asc' | 'desc' };
    take?: number;
    skip?: number;
  }): User[] => {
    let query = 'SELECT * FROM users';
    const params: any[] = [];

    if (options?.where) {
      const conditions: string[] = [];
      Object.entries(options.where).forEach(([key, value]) => {
        if (value !== undefined) {
          conditions.push(`${key} = ?`);
          params.push(value);
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

    return db.prepare(query).all(...params) as User[];
  },

  create: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO users (id, fullName, email, phone, profilePicture, passwordHash, role, status, rating, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.fullName,
      data.email,
      data.phone,
      data.profilePicture,
      data.passwordHash,
      data.role,
      data.status,
      data.rating,
      now,
      now
    );

    return userDAL.findUnique({ id })!;
  },

  update: (where: { id: string }, data: Partial<Omit<User, 'id' | 'createdAt'>>): User => {
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

    const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return userDAL.findUnique(where)!;
  },

  delete: (where: { id: string }): void => {
    db.prepare('DELETE FROM users WHERE id = ?').run(where.id);
  },

  count: (where?: Partial<User>): number => {
    let query = 'SELECT COUNT(*) as count FROM users';
    const params: any[] = [];

    if (where) {
      const conditions: string[] = [];
      Object.entries(where).forEach(([key, value]) => {
        if (value !== undefined) {
          conditions.push(`${key} = ?`);
          params.push(value);
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
