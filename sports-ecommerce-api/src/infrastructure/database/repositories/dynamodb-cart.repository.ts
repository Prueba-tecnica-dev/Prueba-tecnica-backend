import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import { Cart, CartItem } from '../../../domain/entities/cart.entity';
import { dynamoDb } from '../dynamodb.client';

const TABLE_NAME = 'Carts';

export interface CartRepository {
  getByUserId(userId: string): Promise<Cart | null>;
  save(userId: string, items: CartItem[]): Promise<Cart>;
  clear(userId: string): Promise<void>;
}

export class DynamoDBCartRepository implements CartRepository {
  async getByUserId(userId: string): Promise<Cart | null> {
    const result = await dynamoDb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId },
    }));

    return (result.Item as Cart | undefined) ?? null;
  }

  async save(userId: string, items: CartItem[]): Promise<Cart> {
    const cart: Cart = {
      userId,
      items,
      updatedAt: new Date().toISOString(),
    };

    await dynamoDb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: cart,
    }));

    return cart;
  }

  async clear(userId: string): Promise<void> {
    await dynamoDb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        userId,
        items: [],
        updatedAt: new Date().toISOString(),
      },
    }));
  }
}
