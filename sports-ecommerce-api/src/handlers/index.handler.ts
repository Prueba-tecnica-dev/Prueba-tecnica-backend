import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { jsonResponse } from '../shared/http';

export const handler = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return jsonResponse(200, {
    message: 'Sports Ecommerce API is running',
    version: '1.0.0',
    routes: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/me',
      },
      products: 'GET /api/products',
      cart: {
        list: 'GET /api/cart',
        add: 'POST /api/cart',
        remove: 'DELETE /api/cart/{productId}',
      },
      checkout: 'POST /api/checkout',
      purchases: 'GET /api/purchases',
    },
  });
};
