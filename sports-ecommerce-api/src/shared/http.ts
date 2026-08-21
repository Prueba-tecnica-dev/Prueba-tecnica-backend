import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const jsonResponse = (
  statusCode: number,
  body: unknown,
  headers: Record<string, string> = {},
): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    ...headers,
  },
  body: JSON.stringify(body),
});

export const parseBody = <T>(event: APIGatewayProxyEvent): T => {
  if (!event.body) {
    return {} as T;
  }

  try {
    return JSON.parse(event.body) as T;
  } catch {
    throw new Error('Invalid JSON payload');
  }
};

export const getHeader = (event: APIGatewayProxyEvent, name: string): string | undefined => {
  const value = event.headers?.[name] ?? event.headers?.[name.toLowerCase()];
  return value ?? undefined;
};
