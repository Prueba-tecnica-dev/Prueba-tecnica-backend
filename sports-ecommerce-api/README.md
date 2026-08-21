# Sports E-commerce API

API REST para un e-commerce deportivo construida con Node.js, TypeScript, Serverless Framework, DynamoDB Local y JWT.

## Arquitectura

La solución sigue una separación por capas para mantener la lógica ordenada:

- Domain: entidades y contratos de repositorio.
- Application: casos de uso del negocio (registro, login, carrito, checkout).
- Infrastructure: integración con DynamoDB, seguridad, email y logging.
- Handlers: funciones Lambda expuestas por Serverless.
- Middleware: protección de rutas con JWT.
- Shared: utilidades HTTP, logger y email.

## Requisitos

- Node.js 20+
- Docker + Docker Compose
- npm

## Inicialización

1. Instala dependencias:

   npm install

2. Levanta DynamoDB Local:

   docker compose up -d

3. Crea las tablas de DynamoDB:

   npm run tables:create

4. Si quieres cargar productos de ejemplo:

   npm run seed:products

5. Configura variables de entorno en .env:

   cp .env.example .env

   Ajusta al menos:
   - JWT_SECRET
   - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM (opcional para emails reales)

6. Inicia la API local:

   npm run dev

La API quedará disponible en:
- http://localhost:3000

## Auth

### Registrar usuario

POST /api/auth/register

curl:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana",
    "email": "ana@test.com",
    "password": "123456"
  }'
```

Body:

{
  "name": "Ana",
  "email": "ana@test.com",
  "password": "123456"
}

Respuesta esperada:

{
  "message": "User registered",
  "user": {
    "id": "...",
    "name": "Ana",
    "email": "ana@test.com",
    "createdAt": "..."
  }
}

### Login

POST /api/auth/login

curl:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana@test.com",
    "password": "123456"
  }'
```

Body:

{
  "email": "ana@test.com",
  "password": "123456"
}

Respuesta esperada:

{
  "message": "Login successful",
  "accessToken": "eyJ...",
  "user": {
    "id": "...",
    "name": "Ana",
    "email": "ana@test.com"
  }
}

### Perfil autenticado

GET /api/me

curl:

```bash
curl -X GET http://localhost:3000/api/me \
  -H "Authorization: Bearer <token>"
```

Headers:

Authorization: Bearer <token>

## Productos

### Listar productos

GET /api/products?category=running&page=1&limit=10

curl:

```bash
curl -X GET "http://localhost:3000/api/products?category=running&page=1&limit=10"
```

Parámetros:
- category: filtro opcional por categoría
- page: número de página
- limit: cantidad por página

Respuesta esperada:

{
  "page": 1,
  "limit": 10,
  "total": 25,
  "category": "running",
  "items": [
    {
      "id": "...",
      "name": "Zapatillas Runner Pro",
      "category": "running",
      "price": 129.99,
      "stock": 25,
      "imageUrl": "https://...",
      "createdAt": "..."
    }
  ]
}

## Carrito

### Obtener carrito

GET /api/cart

curl:

```bash
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer <token>"
```

Headers:

Authorization: Bearer <token>

### Agregar producto

POST /api/cart

curl:

```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "<product-id>",
    "quantity": 1
  }'
```

Headers:

Authorization: Bearer <token>

Body:

{
  "productId": "...",
  "quantity": 1
}

### Eliminar producto

DELETE /api/cart/{productId}

curl:

```bash
curl -X DELETE http://localhost:3000/api/cart/<product-id> \
  -H "Authorization: Bearer <token>"
```

Headers:

Authorization: Bearer <token>

## Checkout

### Finalizar compra

POST /api/checkout

curl:

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

Headers:

Authorization: Bearer <token>

Validaciones:
- stock disponible
- carrito no vacío
- historial de compra registrado
- email de confirmación enviado si SMTP está configurado

Respuesta esperada:

{
  "message": "Purchase completed successfully",
  "purchaseId": "...",
  "total": 189.5,
  "items": [
    {
      "productId": "...",
      "quantity": 2,
      "unitPrice": 89.5,
      "subtotal": 179
    }
  ]
}

## Base de datos

Se usa DynamoDB Local con las tablas:
- Users
- Products
- Carts
- Purchases

## Logging

Se usa Winston para registrar eventos importantes de auth, catálogo, carrito y checkout.

## Frontend guidance

El frontend puede consumir estas rutas con JSON y JWT:

- Registro: POST /api/auth/register
- Login: POST /api/auth/login
- Perfil: GET /api/me
- Productos: GET /api/products
- Carrito: GET/POST /api/cart
- Eliminar: DELETE /api/cart/:productId
- Checkout: POST /api/checkout

Ejemplo rápido de flujo con curl:

```bash
# 1) Registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","email":"ana@test.com","password":"123456"}'

# 2) Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@test.com","password":"123456"}'

# 3) Ver productos
curl -X GET "http://localhost:3000/api/products?category=running&page=1&limit=10"

# 4) Agregar al carrito
curl -X POST http://localhost:3000/api/cart \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"productId":"<product-id>","quantity":1}'

# 5) Ver carrito
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer <token>"

# 6) Checkout
curl -X POST http://localhost:3000/api/checkout \
  -H "Authorization: Bearer <token>"
```

Cada respuesta usa el formato JSON estándar con statusCode real de la lambda y body serializado en JSON.

## Observaciones

- Las imágenes se usan por URL pública para simular almacenamiento tipo S3/MinIO.
- El módulo de SMTP queda preparado para enviar confirmaciones de compra cuando el entorno lo tiene configurado.
- El backend está listo para ser consumido por un frontend con React, Next.js o cualquier SPA.
