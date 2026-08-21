import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { Agent } from "node:http";

import { env } from "../../config/env";

const httpAgent = new Agent({
  keepAlive: false,
  maxSockets: 10,
});

const dynamoClient = new DynamoDBClient({
  region: env.awsRegion,

  endpoint: env.dynamoDbEndpoint,

  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },

  requestHandler: new NodeHttpHandler({
    httpAgent,

    connectionTimeout: 2_000,

    requestTimeout: 30_000,

    socketTimeout: 30_000,

    throwOnRequestTimeout: true,
  }),

  maxAttempts: 1,
});

export const dynamoDb = DynamoDBDocumentClient.from(
  dynamoClient,
  {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  },
);