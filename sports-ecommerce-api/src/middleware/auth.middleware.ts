import { APIGatewayProxyEvent } from 'aws-lambda';

import { JwtService } from '../infrastructure/database/security/jwt.service';
import { jsonResponse } from '../shared/http';

export const authMiddleware = (
  event: APIGatewayProxyEvent,
  handler: (event: APIGatewayProxyEvent) => Promise<any>,
) => {
  if (event.httpMethod === 'OPTIONS') {
    return handler(event);
  }

  const authHeader = event.headers?.authorization ?? event.headers?.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Promise.resolve(
      jsonResponse(401, { message: 'Authorization header required' }),
    );
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const payload = new JwtService().verify(token);
    const user = { userId: payload.sub, email: payload.email };

    return handler({
      ...event,
      requestContext: {
        ...event.requestContext,
        authorizer: { jwt: user },
      },
    });
  } catch (error) {
    return Promise.resolve(
      jsonResponse(401, { message: 'Invalid or expired token' }),
    );
  }
};
