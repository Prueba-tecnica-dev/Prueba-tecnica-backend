import {
  CreateTableCommand,
  ResourceInUseException,
} from "@aws-sdk/client-dynamodb";

import { dynamoDb } from "./dynamodb.client";

const tables = [
  {
    TableName: "Users",

    KeySchema: [
      {
        AttributeName: "id",
        KeyType: "HASH" as const,
      },
    ],

    AttributeDefinitions: [
      {
        AttributeName: "id",
        AttributeType: "S" as const,
      },
    ],
  },

  {
    TableName: "Products",

    KeySchema: [
      {
        AttributeName: "id",
        KeyType: "HASH" as const,
      },
    ],

    AttributeDefinitions: [
      {
        AttributeName: "id",
        AttributeType: "S" as const,
      },
    ],
  },

  {
    TableName: "Carts",

    KeySchema: [
      {
        AttributeName: "userId",
        KeyType: "HASH" as const,
      },
    ],

    AttributeDefinitions: [
      {
        AttributeName: "userId",
        AttributeType: "S" as const,
      },
    ],
  },

  {
    TableName: "Purchases",

    KeySchema: [
      {
        AttributeName: "id",
        KeyType: "HASH" as const,
      },
    ],

    AttributeDefinitions: [
      {
        AttributeName: "id",
        AttributeType: "S" as const,
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