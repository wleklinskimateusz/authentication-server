import { BaseError } from "../common/error";
import type { User } from "../domain/user";

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  permissionGroups: string[];
  iat?: number;
  exp?: number;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

export class JWTService {
  private readonly accessTokenSecret: string;
  private readonly accessTokenExpiry: number; // in seconds

  constructor() {
    this.accessTokenSecret =
      process.env.JWT_ACCESS_SECRET || "your-access-secret-key";
    this.accessTokenExpiry = parseInt(process.env.JWT_ACCESS_EXPIRY || "86400"); // 24 hours
  }

  async generateAccessToken(user: User): Promise<TokenResponse> {
    const accessToken = await this.createAccessToken(user);

    return {
      accessToken,
      expiresIn: this.accessTokenExpiry,
    };
  }

  private async createAccessToken(user: User): Promise<string> {
    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      permissionGroups: user.permissionGroups,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.accessTokenExpiry,
    };

    const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" })
    ).toString("base64");
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64");
    const signature = await this.createSignature(
      header + "." + payloadStr,
      this.accessTokenSecret
    );

    return `${header}.${payloadStr}.${signature}`;
  }

  private async createSignature(data: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(data);

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, messageData);
    return Buffer.from(signature).toString("base64");
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new JWTInvalidTokenError("Invalid token format");
      }

      const [header, payload, signature] = parts;

      if (!header || !payload || !signature) {
        throw new JWTInvalidTokenError("Invalid token format");
      }

      const expectedSignature = await this.createSignature(
        header + "." + payload,
        this.accessTokenSecret
      );
      if (signature !== expectedSignature) {
        throw new JWTInvalidTokenError("Invalid token signature");
      }

      const decodedPayload = JSON.parse(
        Buffer.from(payload, "base64").toString()
      ) as TokenPayload;

      if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
        throw new JWTTokenExpiredError("Access token has expired");
      }

      return decodedPayload;
    } catch (error) {
      if (
        error instanceof JWTInvalidTokenError ||
        error instanceof JWTTokenExpiredError
      ) {
        throw error;
      }
      throw new JWTInvalidTokenError("Invalid access token format");
    }
  }

  extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1] || null;
  }

  getTokenExpirationTime(): Date {
    const now = new Date();
    return new Date(now.getTime() + this.accessTokenExpiry * 1000);
  }

  async isTokenNearExpiry(token: string): Promise<boolean> {
    try {
      const payload = await this.verifyAccessToken(token);
      if (!payload.exp) {
        return true;
      }

      const oneHourFromNow = Date.now() + 60 * 60 * 1000;
      return payload.exp * 1000 <= oneHourFromNow;
    } catch {
      return true;
    }
  }

  decodeTokenWithoutVerification(token: string): TokenPayload | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      if (!payload) {
        return null;
      }

      return JSON.parse(atob(payload)) as TokenPayload;
    } catch {
      return null;
    }
  }
}

export class JWTInvalidTokenError extends BaseError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class JWTTokenExpiredError extends BaseError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class JWTTokenMissingError extends BaseError {
  constructor(message: string) {
    super(message, 401);
  }
}
