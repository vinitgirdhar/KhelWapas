import db from '../db';
import { randomUUID } from 'crypto';

export interface Order {
  id: string;
  userId: string;
  items: string; // JSON string
  totalPrice: string;
  paymentStatus: 'paid' | 'pending';
  fulfillmentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export const orderDAL = {
  findUnique: (where: { id: string }, include?: { user?: boolean }): any => {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(where.id) as Order | undefined;
    
    if (!order) return undefined;

    if (include?.user) {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(order.userId);
      return { ...order, user };
    }

    return order;
  },

  findMany: (options?: {
    where?: Partial<Order>;
    orderBy?: { [key: string]: 'asc' | 'desc' };
    take?: number;
    skip?: number;
    include?: { user?: boolean };
    select?: any;
  }): any[] => {
    let query = 'SELECT * FROM orders';
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

    const orders = db.prepare(query).all(...params) as Order[];

    if (options?.include?.user) {
      return orders.map(order => {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(order.userId);
        return { ...order, user };
      });
    }

    return orders;
  },

  create: (data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO orders (id, userId, items, totalPrice, paymentStatus, fulfillmentStatus, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.userId,
      data.items,
      data.totalPrice,
      data.paymentStatus,
      data.fulfillmentStatus,
      now,
      now
    );

    return orderDAL.findUnique({ id })!;
  },

  update: (where: { id: string }, data: Partial<Omit<Order, 'id' | 'createdAt'>>): Order => {
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

    const stmt = db.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return orderDAL.findUnique(where)!;
  },

  count: (where?: Partial<Order>): number => {
    let query = 'SELECT COUNT(*) as count FROM orders';
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

  aggregate: (options: { _sum?: { totalPrice?: boolean } }): any => {
    if (options._sum?.totalPrice) {
      const result = db.prepare('SELECT SUM(CAST(totalPrice AS REAL)) as sum FROM orders').get() as { sum: number | null };
      return { _sum: { totalPrice: result.sum || 0 } };
    }
    return {};
  },
};
