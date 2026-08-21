import { ScanCommand, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDb } from '../dynamodb.client';
import { Product } from '../../../domain/entities/product.entity';

const TABLE_NAME = 'Products';

export interface ProductRepository {
  list(filters?: { category?: string; limit?: number }): Promise<{ items: Product[]; count: number }>; 
  findById(id: string): Promise<Product | null>;
  findByIds(ids: string[]): Promise<Product[]>;
  updateStock(productId: string, stock: number): Promise<void>;
  create(product: Product): Promise<Product>;
}

export class DynamoDBProductRepository implements ProductRepository {
  async create(product: Product): Promise<Product> {
    await dynamoDb.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: product,
    }));

    return product;
  }

  async list(filters?: { category?: string; limit?: number }): Promise<{ items: Product[]; count: number }> {
    const limit = filters?.limit ?? 20;
    const params: any = {
      TableName: TABLE_NAME,
      Limit: limit,
    };

    if (filters?.category) {
      params.FilterExpression = 'category = :category';
      params.ExpressionAttributeValues = {
        ':category': filters.category,
      };
    }

    const result = await dynamoDb.send(new ScanCommand(params));
    const items = (result.Items ?? []) as Product[];

    return { items, count: items.length };
  }

  async findById(id: string): Promise<Product | null> {
    const result = await dynamoDb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    }));

    return (result.Item as Product | undefined) ?? null;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    if (!ids.length) {
      return [];
    }

    const uniqueIds = [...new Set(ids)];
    const products = await Promise.all(uniqueIds.map((id) => this.findById(id)));
    return products.filter((product): product is Product => product !== null);
  }

  async updateStock(productId: string, stock: number): Promise<void> {
    await dynamoDb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: productId },
      UpdateExpression: 'SET stock = :stock',
      ExpressionAttributeValues: {
        ':stock': stock,
      },
    }));
  }
}
