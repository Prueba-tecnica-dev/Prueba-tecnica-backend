import { randomUUID } from 'node:crypto';

import { env } from '../src/config/env';
import { dynamoDb } from '../src/infrastructure/database/dynamodb.client';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

const products = [
  {
    id: randomUUID(),
    name: 'Zapatillas Runner Pro',
    category: 'running',
    price: 129.99,
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'Mancuernas Ajustables',
    category: 'fitness',
    price: 89.5,
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'Pelota de Fútbol',
    category: 'football',
    price: 34.9,
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    name: 'Bicicleta de Montaña',
    category: 'cycling',
    price: 499.99,
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
];

async function main() {
  for (const product of products) {
    await dynamoDb.send(new PutCommand({
      TableName: 'Products',
      Item: product,
    }));
  }

  console.log(`Seeded ${products.length} products`);
}

main().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
