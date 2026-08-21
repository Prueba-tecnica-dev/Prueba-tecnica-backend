import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { DynamoDBPurchaseRepository } from '../infrastructure/database/repositories/dynamodb-purchase.repository';
import { authMiddleware } from '../middleware/auth.middleware';
import { jsonResponse } from '../shared/http';
import { logger } from '../shared/logger';

const purchaseRepository = new DynamoDBPurchaseRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return authMiddleware(event, async (secureEvent) => {
    try {
      const userId = secureEvent.requestContext?.authorizer?.jwt?.userId;

      if (!userId) {
        return jsonResponse(401, { message: 'Unauthorized' });
      }

      const purchases = await purchaseRepository.getByUserId(userId);
      logger.info('Purchases fetched', { userId, count: purchases.length });

      return jsonResponse(200, { purchases });
    } catch (error) {
      logger.error('Purchases handler failed', { error: error instanceof Error ? error.message : error });
      return jsonResponse(500, { message: 'Unable to fetch purchase history' });
    }
  });
};
