import { Request, Response, NextFunction } from 'express';

/**
 * Response formatter middleware
 * Ensures all API responses follow the standard format with proper Content-Type header
 */
export function responseFormatter(_req: Request, res: Response, next: NextFunction) {
  // Set Content-Type header for all responses
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Store the original json method
  const originalJson = res.json.bind(res);
  
  // Override json method to ensure standard response format
  res.json = function (data: any) {
    // If data already has status field, use it as is
    if (data && typeof data === 'object' && 'status' in data) {
      return originalJson(data);
    }
    
    // Otherwise wrap in standard format
    const response = {
      status: 'success',
      data: data,
    };
    
    return originalJson(response);
  };
  
  next();
}
