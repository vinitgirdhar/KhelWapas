import db from '../db';
import { randomUUID } from 'crypto';

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  cardLast4: string | null;
  cardType: 'visa' | 'mastercard' | 'rupay' | 'amex' | null;
  cardHolder: string | null;
  expiryMonth: number | null;
  expiryYear: number | null;
  upiId: string | null;
  nickname: string | null;
  isDefault: number;
  createdAt: string;
  updatedAt: string;
}

export const paymentMethodDAL = {
  findUnique: (where: { id: string }): PaymentMethod | undefined => {
    return db.prepare('SELECT * FROM payment_methods WHERE id = ?').get(where.id) as PaymentMethod | undefined;
  },

  findMany: (options?: {
    where?: Partial<PaymentMethod>;
    orderBy?: { [key: string]: 'asc' | 'desc' };
  }): PaymentMethod[] => {
    let query = 'SELECT * FROM payment_methods';
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

    return db.prepare(query).all(...params) as PaymentMethod[];
  },

  create: (data: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): PaymentMethod => {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO payment_methods (id, userId, type, cardLast4, cardType, cardHolder, expiryMonth, expiryYear, upiId, nickname, isDefault, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.userId,
      data.type,
      data.cardLast4,
      data.cardType,
      data.cardHolder,
      data.expiryMonth,
      data.expiryYear,
      data.upiId,
      data.nickname,
      data.isDefault,
      now,
      now
    );

    return paymentMethodDAL.findUnique({ id })!;
  },

  update: (where: { id: string }, data: Partial<Omit<PaymentMethod, 'id' | 'createdAt'>>): PaymentMethod => {
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

    const stmt = db.prepare(`UPDATE payment_methods SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return paymentMethodDAL.findUnique(where)!;
  },

  delete: (where: { id: string }): void => {
    db.prepare('DELETE FROM payment_methods WHERE id = ?').run(where.id);
  },

  updateMany: (where: Partial<PaymentMethod>, data: Partial<PaymentMethod>): void => {
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
      const stmt = db.prepare(`UPDATE payment_methods SET ${updates.join(', ')} WHERE ${conditions.join(' AND ')}`);
      stmt.run(...params);
    }
  },
};
