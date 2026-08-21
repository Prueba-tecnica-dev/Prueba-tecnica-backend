import jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: string;
  email: string;
}

export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string;

  constructor() {
    this.secret =
      process.env.JWT_SECRET ?? "";

    this.expiresIn =
      process.env.JWT_EXPIRES_IN ?? "1h";

    if (!this.secret) {
      throw new Error(
        "JWT_SECRET is not configured",
      );
    }
  }

  sign(
    payload: JwtPayload,
  ): string {
    return jwt.sign(
      payload,
      this.secret,
      {
        expiresIn:
          this.expiresIn as jwt.SignOptions["expiresIn"],
      },
    );
  }

  verify(
    token: string,
  ): JwtPayload {
    return jwt.verify(
      token,
      this.secret,
    ) as JwtPayload;
  }
}