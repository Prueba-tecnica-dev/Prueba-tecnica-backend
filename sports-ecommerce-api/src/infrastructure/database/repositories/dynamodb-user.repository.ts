import {
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

import { dynamoDb } from "../dynamodb.client";

import { User } from "../../../domain/entities/user.entity";
import { UserRepository } from "../../../domain/repositories/user.repository";

const TABLE_NAME = "Users";

export class DynamoDBUserRepository
  implements UserRepository
{
  async create(user: User): Promise<User> {
    await dynamoDb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: user,
        ConditionExpression:
          "attribute_not_exists(id)",
      }),
    );

    return user;
  }

  async findByEmail(
    email: string,
  ): Promise<User | null> {
    const result = await dynamoDb.send(
      new QueryCommand({
        TableName: TABLE_NAME,

        IndexName: "EmailIndex",

        KeyConditionExpression:
          "email = :email",

        ExpressionAttributeValues: {
          ":email": email,
        },

        Limit: 1,
      }),
    );

    return (
      (result.Items?.[0] as User | undefined) ??
      null
    );
  }

  async findById(
    id: string,
  ): Promise<User | null> {
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: TABLE_NAME,

        Key: {
          id,
        },
      }),
    );

    return (result.Item as User | undefined) ?? null;
  }
}