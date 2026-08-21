# Sports E-commerce API

API REST para un e-commerce deportivo construida con Node.js, TypeScript, Serverless Framework, DynamoDB Local y JWT.

## Arquitectura

La solución está organizada por capas para mantener el backend limpio y escalable:

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

## 1) Preparación inicial

Ejecutá esto desde la carpeta del proyecto:

```bash
cd "/home/cesar/Documentos/prueba tecnica backend/sports-ecommerce-api"
npm install
cp .env.example .env
```

Ajustá el archivo `.env` con tus valores reales. Si no vas a usar SMTP, podés dejarlo vacío.

```bash
JWT_SECRET=mi_secret_super_seguro
JWT_EXPIRES_IN=1h
AWS_REGION=us-east-1
DYNAMODB_ENDPOINT=http://localhost:8000
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

## 2) Levantar infraestructura

```bash
docker compose up -d
```
```bash
npm run tables:create
```

Si querés probar con productos precargados:

```bash
npm run seed:products
```

## 3) Levantar la API local

```bash
npm run dev
```

La API queda disponible en:

- http://localhost:3000
- Lambda local: http://localhost:4000

## 4) Flujo de prueba rápido (copiar y pegar)

### A. Registrar usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ana",
    "email": "ana@test.com",
    "password": "123456"
  }'
```

### B. Login para obtener JWT

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana@test.com",
    "password": "123456"
  }'
```

Guardá el token que devuelve la respuesta. Por ejemplo:

```bash
TOKEN="<token_devuelto_en_accessToken>"
```

### C. Ver perfil autenticado

```bash
curl -X GET http://localhost:3000/api/me \
  -H "Authorization: Bearer $TOKEN"
```

### D. Ver productos

```bash
curl -X GET "http://localhost:3000/api/products?category=running&page=1&limit=10"
```

### E. Ver carrito

```bash
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer $TOKEN"
```

### F. Agregar producto al carrito

Primero obtené un productId válido de la respuesta de /api/products.

```bash
PRODUCT_ID="<product_id_de_la_lista>"

curl -X POST http://localhost:3000/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "'$PRODUCT_ID'",
    "quantity": 1
  }'
```

### G. Eliminar un producto del carrito

```bash
curl -X DELETE "http://localhost:3000/api/cart/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### H. Checkout

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### I. Ver historial de compras

```bash
curl -X GET http://localhost:3000/api/purchases \
  -H "Authorization: Bearer $TOKEN"
```

## 5) Endpoints disponibles

### Auth

- POST /api/auth/register
- POST /api/auth/login
- GET /api/me

### Productos

- GET /api/products

### Carrito

- GET /api/cart
- POST /api/cart
- DELETE /api/cart/{productId}

### Checkout

- POST /api/checkout

### Compras

- GET /api/purchases

## 6) Respuestas esperadas

### Registro

```json
{
  "message": "User registered",
  "user": {
    "id": "...",
    "name": "Ana",
    "email": "ana@test.com",
    "createdAt": "..."
  }
}
```

### Login

```json
{
  "message": "Login successful",
  "accessToken": "eyJ...",
  "user": {
    "id": "...",
    "name": "Ana",
    "email": "ana@test.com"
  }
}
```

### Productos

```json
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
```

### Checkout

```json
{
  "message": "Checkout successful",
  "order": {
    "id": "...",
    "total": 199.98,
    "items": [
      {
        "productId": "...",
        "quantity": 1
      }
    ]
  }
}
```

## 7) Observaciones

- El guardado de productos y compras se hace contra DynamoDB Local.
- La autenticación usa JWT en el header Authorization.
- El checkout valida stock, carrito activo y genera historial de compra.
- Si SMTP está configurado, se envía correo de confirmación.

## 8) Troubleshooting

Si aparece un error como `Cannot find module .../src/handlers/...` o rutas viejas de `dist`, cerrá todas las instancias de `serverless offline` y volvé a levantarlas con:

```bash
pkill -f "serverless offline" || true
pkill -f "node .*serverless" || true
rm -rf .serverless
npm run dev
```

Eso limpia la caché del runtime local y fuerza la configuración nueva.


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
