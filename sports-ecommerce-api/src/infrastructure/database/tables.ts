import {
  CreateTableCommand,
  ResourceInUseException,
} from "@aws-sdk/client-dynamodb";

import { dynamoDb } from "./dynamodb.client";

const tables: Array<{
  TableName: string;
  KeySchema: Array<{ AttributeName: string; KeyType: "HASH" | "RANGE" }>;
  AttributeDefinitions: Array<{ AttributeName: string; AttributeType: "S" | "N" | "B" }>;
  GlobalSecondaryIndexes?: Array<{
    IndexName: string;
    KeySchema: Array<{ AttributeName: string; KeyType: "HASH" | "RANGE" }>;
    Projection: { ProjectionType: "ALL" | "KEYS_ONLY" | "INCLUDE" };
  }>;
}> = [
  {
    TableName: "Users",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "email", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "EmailIndex",
        KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  {
    TableName: "Products",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
  },
  {
    TableName: "Carts",
    KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "userId", AttributeType: "S" }],
  },
  {
    TableName: "Purchases",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "UserIdIndex",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
];

async function createTable(
  table: (typeof tables)[number],
): Promise<void> {
  try {
    await dynamoDb.send(
        new CreateTableCommand({
            TableName: table.TableName,

            BillingMode: "PAY_PER_REQUEST",

            KeySchema: table.KeySchema,

            AttributeDefinitions:
                table.AttributeDefinitions,

            GlobalSecondaryIndexes:
                table.GlobalSecondaryIndexes,
        }),
    );

    console.log(`✓ ${table.TableName} created`);
  } catch (error) {
    if (error instanceof ResourceInUseException) {
      console.log(
        `✓ ${table.TableName} already exists`,
      );

      return;
    }

    throw error;
  }
}

async function main(): Promise<void> {
  console.log("Initializing DynamoDB tables...");

  for (const table of tables) {
    await createTable(table);
  }

  console.log(
    "✓ DynamoDB infrastructure ready",
  );
}

main().catch((error: unknown) => {
  console.error(
    "✗ DynamoDB initialization failed",
  );

  console.error(error);

  process.exit(1);
});