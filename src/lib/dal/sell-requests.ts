import db from '../db';
import { randomUUID } from 'crypto';

export interface SellRequest {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  category: string;
  title: string;
  description: string;
  price: string;
  contactMethod: 'Email' | 'Phone' | 'WhatsApp';
  contactDetail: string | null;
  imageUrls: string; // JSON string
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export const sellRequestDAL = {
  findUnique: (where: { id: string }, include?: { user?: boolean }): any => {
    const request = db.prepare('SELECT * FROM sell_requests WHERE id = ?').get(where.id) as SellRequest | undefined;
    
    if (!request) return undefined;

    if (include?.user) {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(request.userId);
      return { ...request, user };
    }

    return request;
  },

  findFirst: (options: {
    where?: Partial<SellRequest>;
    orderBy?: { [key: string]: 'asc' | 'desc' };
    include?: { user?: boolean };
  }): any => {
    let query = 'SELECT * FROM sell_requests';
    const params: any[] = [];

    if (options.where) {
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

    if (options.orderBy) {
      const orderClauses = Object.entries(options.orderBy).map(
        ([key, direction]) => `${key} ${direction.toUpperCase()}`
      );
      query += ' ORDER BY ' + orderClauses.join(', ');
    }

    query += ' LIMIT 1';

    const request = db.prepare(query).get(...params) as SellRequest | undefined;

    if (!request) return undefined;

    if (options.include?.user) {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(request.userId);
      return { ...request, user };
    }

    return request;
  },

  findMany: (options?: {
    where?: Partial<SellRequest>;
    orderBy?: { [key: string]: 'asc' | 'desc' };
    take?: number;
    skip?: number;
    include?: { user?: boolean };
  }): any[] => {
    let query = 'SELECT * FROM sell_requests';
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

    const requests = db.prepare(query).all(...params) as SellRequest[];

    if (options?.include?.user) {
      return requests.map(request => {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(request.userId);
        return { ...request, user };
      });
    }

    return requests;
  },

  create: (data: Omit<SellRequest, 'id' | 'createdAt' | 'updatedAt'>): SellRequest => {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO sell_requests (id, userId, fullName, email, category, title, description, price, contactMethod, contactDetail, imageUrls, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.userId,
      data.fullName,
      data.email,
      data.category,
      data.title,
      data.description,
      data.price,
      data.contactMethod,
      data.contactDetail,
      data.imageUrls,
      data.status,
      now,
      now
    );

    return sellRequestDAL.findUnique({ id })!;
  },

  update: (where: { id: string }, data: Partial<Omit<SellRequest, 'id' | 'createdAt'>>): SellRequest => {
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

    const stmt = db.prepare(`UPDATE sell_requests SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);

    return sellRequestDAL.findUnique(where)!;
  },

  count: (where?: Partial<SellRequest>): number => {
    let query = 'SELECT COUNT(*) as count FROM sell_requests';
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
