import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { CartService } from '../application/cart/cart.service';
import { DynamoDBCartRepository } from '../infrastructure/database/repositories/dynamodb-cart.repository';
import { DynamoDBProductRepository } from '../infrastructure/database/repositories/dynamodb-product.repository';
import { authMiddleware } from '../middleware/auth.middleware';
import { jsonResponse, parseBody } from '../shared/http';
import { logger } from '../shared/logger';

const cartRepository = new DynamoDBCartRepository();
const productRepository = new DynamoDBProductRepository();
const cartService = new CartService();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return authMiddleware(event, async (secureEvent) => {
    try {
      const userId = secureEvent.requestContext?.authorizer?.jwt?.userId;

      if (!userId) {
        return jsonResponse(401, { message: 'User not authorized' });
      }

      if (event.httpMethod === 'OPTIONS') {
        return jsonResponse(200, { ok: true });
      }

      if (event.httpMethod === 'GET') {
        const cart = await cartRepository.getByUserId(userId);
        const products = await productRepository.findByIds((cart?.items ?? []).map((item) => item.productId));
        const items = (cart?.items ?? []).map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          return product ? { ...product, quantity: item.quantity } : null;
        }).filter(Boolean);

        return jsonResponse(200, {
          items,
          total: cartService.getTotal(cart?.items ?? [], products),
        });
      }

      if (event.httpMethod === 'POST') {
        const payload = parseBody<{ productId: string; quantity?: number }>(event);
        const product = await productRepository.findById(payload.productId);

        if (!product) {
          return jsonResponse(404, { message: 'Product not found' });
        }

        const cart = (await cartRepository.getByUserId(userId)) ?? { userId, items: [], updatedAt: new Date().toISOString() };
        const updatedCart = cartService.addItem(cart.items, product, payload.quantity ?? 1);

        if (updatedCart.some((item) => item.quantity > product.stock && item.productId === product.id)) {
          return jsonResponse(400, { message: 'Insufficient stock' });
        }

        const saved = await cartRepository.save(userId, updatedCart);
        logger.info('Product added to cart', { userId, productId: product.id });

        return jsonResponse(200, {
          message: 'Product added to cart',
          cart: saved,
        });
      }

      if (event.httpMethod === 'DELETE') {
        const productId = event.path.split('/').pop() ?? '';
        const cart = (await cartRepository.getByUserId(userId)) ?? { userId, items: [], updatedAt: new Date().toISOString() };
        const updatedCart = cartService.removeItem(cart.items, productId);
        const saved = await cartRepository.save(userId, updatedCart);
        logger.info('Product removed from cart', { userId, productId });

        return jsonResponse(200, {
          message: 'Product removed from cart',
          cart: saved,
        });
      }

      return jsonResponse(405, { message: 'Method not allowed' });
    } catch (error) {
      logger.error('Cart handler failed', { error: error instanceof Error ? error.message : error });
      return jsonResponse(500, { message: 'Error on cart flow' });
    }
  });
};
