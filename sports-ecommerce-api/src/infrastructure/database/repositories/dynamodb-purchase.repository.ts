import { PutCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

import { Purchase } from '../../../domain/entities/purchase.entity';
import { dynamoDb } from '../dynamodb.client';

const TABLE_NAME = 'Purchases';

export interface PurchaseRepository {
  create(purchase: Purchase): Promise<Purchase>;
  getByUserId(userId: string): Promise<Purchase[]>;
}

export class DynamoDBPurchaseRepository implements PurchaseRepository {
  async create(purchase: Purchase): Promise<Purchase> {
    await dynamoDb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: purchase,
    }));

    return purchase;
  }

  async getByUserId(userId: string): Promise<Purchase[]> {
    const result = await dynamoDb.send(new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    }));

    return (result.Items as Purchase[]) ?? [];
  }
}
