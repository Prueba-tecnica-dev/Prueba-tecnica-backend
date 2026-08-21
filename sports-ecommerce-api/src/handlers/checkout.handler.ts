import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { randomUUID } from 'node:crypto';

import { CheckoutService } from '../application/checkout/checkout.service';
import { DynamoDBCartRepository } from '../infrastructure/database/repositories/dynamodb-cart.repository';
import { DynamoDBProductRepository } from '../infrastructure/database/repositories/dynamodb-product.repository';
import { DynamoDBPurchaseRepository } from '../infrastructure/database/repositories/dynamodb-purchase.repository';
import { DynamoDBUserRepository } from '../infrastructure/database/repositories/dynamodb-user.repository';
import { EmailService } from '../shared/email.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { jsonResponse } from '../shared/http';
import { logger } from '../shared/logger';

const cartRepository = new DynamoDBCartRepository();
const productRepository = new DynamoDBProductRepository();
const purchaseRepository = new DynamoDBPurchaseRepository();
const checkoutService = new CheckoutService();
const emailService = new EmailService();
const userRepository = new DynamoDBUserRepository();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return authMiddleware(event, async (secureEvent) => {
    try {
      const userId = secureEvent.requestContext?.authorizer?.jwt?.userId;
      const cart = (await cartRepository.getByUserId(userId ?? '')) ?? { userId: userId ?? '', items: [], updatedAt: new Date().toISOString() };

      if (!cart.items.length) {
        return jsonResponse(400, { message: 'Cart is empty' });
      }

      const products = await productRepository.findByIds(cart.items.map((item) => item.productId));
      const validation = checkoutService.validateCart(cart.items, products);

      const purchaseId = randomUUID();

      for (const item of validation.items) {
        const product = products.find((entry) => entry.id === item.productId);
        if (!product) {
          continue;
        }

        await productRepository.updateStock(product.id, product.stock - item.quantity);
      }

      await purchaseRepository.create({
        id: purchaseId,
        userId: userId ?? '',
        items: validation.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        total: validation.total,
        status: 'completed',
        createdAt: new Date().toISOString(),
      });

      await cartRepository.clear(userId ?? '');

      const user = await userRepository.findById(userId ?? '');
      if (user) {
        await emailService.sendPurchaseConfirmation(user.email, user.name, validation.total);
      }

      logger.info('Purchase completed', { purchaseId, userId, total: validation.total });

      return jsonResponse(200, {
        message: 'Purchase completed successfully',
        purchaseId,
        total: validation.total,
        items: validation.items,
      });
    } catch (error) {
      logger.error('Checkout failed', { error: error instanceof Error ? error.message : error });
      return jsonResponse(400, {
        message: error instanceof Error ? error.message : 'Checkout failed',
      });
    }
  });
};
