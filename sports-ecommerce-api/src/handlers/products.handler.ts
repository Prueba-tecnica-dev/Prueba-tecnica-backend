import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { DynamoDBProductRepository } from '../infrastructure/database/repositories/dynamodb-product.repository';
import { jsonResponse, parseBody } from '../shared/http';
import { logger } from '../shared/logger';

const productRepository = new DynamoDBProductRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return jsonResponse(200, { ok: true });
    }

    if (event.httpMethod !== 'GET') {
      return jsonResponse(405, { message: 'Method not allowed' });
    }

    const category = event.queryStringParameters?.category ?? undefined;
    const page = Number(event.queryStringParameters?.page ?? '1');
    const limit = Number(event.queryStringParameters?.limit ?? '10');

    const result = await productRepository.list({
      category,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
    });

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const start = (safePage - 1) * (Number.isFinite(limit) && limit > 0 ? limit : 10);
    const items = result.items.slice(start, start + (Number.isFinite(limit) && limit > 0 ? limit : 10));

    logger.info('Products listed', { category, count: items.length, page: safePage });

    return jsonResponse(200, {
      page: safePage,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
      total: result.count,
      category: category ?? 'all',
      items,
    });
  } catch (error) {
    logger.error('Products handler failed', { error: error instanceof Error ? error.message : error });
    return jsonResponse(500, { message: 'Error listing products' });
  }
};
