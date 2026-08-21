import "dotenv/config";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",

  awsRegion: process.env.AWS_REGION ?? "us-east-1",

  dynamoDbEndpoint:
    process.env.DYNAMODB_ENDPOINT ?? "http://localhost:8000",

  jwtSecret: process.env.JWT_SECRET ?? "development-secret",

  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? "",
    password: process.env.SMTP_PASSWORD ?? "",
    from: process.env.SMTP_FROM ?? "",
  },
};