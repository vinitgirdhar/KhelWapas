import db from '../db';
import { randomUUID } from 'crypto';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  productId: string;
  userId: string;
  reviewerName: string;
  reviewerImage: string | null;
}

export const reviewDAL = {
  findMany: (options?: {
    where?: Partial<Review>;
    orderBy?: { [key: string]: 'asc' | 'desc' };
  }): Review[] => {
    let query = 'SELECT * FROM reviews';
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

    return db.prepare(query).all(...params) as Review[];
  },

  create: (data: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Review => {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO reviews (id, rating, comment, createdAt, updatedAt, productId, userId, reviewerName, reviewerImage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.rating,
      data.comment,
      now,
      now,
      data.productId,
      data.userId,
      data.reviewerName,
      data.reviewerImage
    );

    const result = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id) as Review;
    return result;
  },
};
