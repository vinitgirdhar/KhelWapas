import db from '../db';
import { randomUUID } from 'crypto';

export interface Address {
  id: string;
  userId: string;
  title: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: number;
  createdAt: string;
  updatedAt: string;
}

export const addressDAL = {
  findUnique: (where: { id: string }): Address | undefined => {
    return db.prepare('SELECT * FROM addresses WHERE id = ?').get(where.id) as Address | undefined;
  },

  findMany: (options?: {
    where?: Partial<Address>;
    orderBy?: { [key: string]: 'asc' | 'desc' };
  }): Address[] => {
    let query = 'SELECT * FROM addresses';
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

    return db.prepare(query).all(...params) as Address[];
  },

  create: (data: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Address => {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO addresses (id, userId, title, fullName, phone, street, city, state, postalCode, country, isDefault, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.userId,
      data.title,
      data.fullName,
      data.phone,
      data.street,
      data.city,
      data.state,
      data.postalCode,
      data.country,
      data.isDefault,
      now,
      now
    );

    return addressDAL.findUnique({ id })!;
  },

  update: (where: { id: string }, data: Partial<Omit<Address, 'id' | 'createdAt'>>): Address => {
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

    const stmt = db.prepare(`UPDATE addresses SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return addressDAL.findUnique(where)!;
  },

  delete: (where: { id: string }): void => {
    db.prepare('DELETE FROM addresses WHERE id = ?').run(where.id);
  },

  updateMany: (where: Partial<Address>, data: Partial<Address>): void => {
    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });

    const conditions: string[] = [];
    Object.entries(where).forEach(([key, value]) => {
      if (value !== undefined) {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (updates.length > 0 && conditions.length > 0) {
      const stmt = db.prepare(`UPDATE addresses SET ${updates.join(', ')} WHERE ${conditions.join(' AND ')}`);
      stmt.run(...params);
    }
  },
};
