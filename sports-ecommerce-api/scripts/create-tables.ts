import {
  DynamoDBClient,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";

import { env } from "../src/config/env";

const client = new DynamoDBClient({
  region: env.awsRegion,
  endpoint: env.dynamoDbEndpoint,

  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
});

async function testConnection(): Promise<void> {
  console.log("DynamoDB endpoint:", env.dynamoDbEndpoint);

  console.log("Testing DynamoDB connection...");

  const result = await client.send(
    new ListTablesCommand({}),
  );

  console.log("DynamoDB response:");

  console.log(result);
}

testConnection().catch((error: unknown) => {
  console.error("DynamoDB connection failed:");
  console.error(error);

  process.exit(1);
});