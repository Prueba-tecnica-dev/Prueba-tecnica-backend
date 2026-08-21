import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { RegisterUserUseCase } from '../application/auth/register-user.use-case';
import { LoginUserUseCase } from '../application/auth/login-user.use-case';
import { DynamoDBUserRepository } from '../infrastructure/database/repositories/dynamodb-user.repository';
import { PasswordService } from '../infrastructure/database/security/password.service';
import { JwtService } from '../infrastructure/database/security/jwt.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { jsonResponse, parseBody, getHeader } from '../shared/http';
import { logger } from '../shared/logger';

const userRepository = new DynamoDBUserRepository();
const passwordService = new PasswordService();
const jwtService = new JwtService();

const registerUseCase = new RegisterUserUseCase(userRepository);
const loginUseCase = new LoginUserUseCase(userRepository, passwordService, jwtService);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return jsonResponse(200, { ok: true });
    }

    if (event.path.endsWith('/api/me')) {
      return authMiddleware(event, async (secureEvent) => {
        const userId = secureEvent.requestContext?.authorizer?.jwt?.userId;
        const user = await userRepository.findById(userId ?? '');

        return jsonResponse(200, {
          user: user ? { id: user.id, name: user.name, email: user.email } : null,
        });
      });
    }

    if (event.path.endsWith('/api/auth/register') && event.httpMethod === 'POST') {
      const payload = parseBody<{ name: string; email: string; password: string }>(event);
      const user = await registerUseCase.execute(payload);
      logger.info('User registered', { email: payload.email });
      return jsonResponse(201, { message: 'User registered', user });
    }

    if (event.path.endsWith('/api/auth/login') && event.httpMethod === 'POST') {
      const payload = parseBody<{ email: string; password: string }>(event);
      const result = await loginUseCase.execute(payload);
      logger.info('User logged in', { email: payload.email });
      return jsonResponse(200, { message: 'Login successful', ...result });
    }

    return jsonResponse(404, { message: 'Route not found' });
  } catch (error) {
    logger.error('Auth handler failed', { error: error instanceof Error ? error.message : error });
    return jsonResponse(400, {
      message: error instanceof Error ? error.message : 'Unexpected auth error',
    });
  }
};
