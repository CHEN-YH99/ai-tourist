import { Model } from 'mongoose';
import { PaginatedResponse } from '../types/index.js';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export async function paginate<T>(
  model: Model<any>,
  query: any,
  { page, pageSize }: PaginationParams,
  sort: any = { createdAt: -1 }
): Promise<PaginatedResponse<T>> {
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    model.find(query).sort(sort).skip(skip).limit(pageSize).lean(),
    model.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
