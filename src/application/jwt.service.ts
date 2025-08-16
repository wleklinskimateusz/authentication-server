import { z } from "zod";
import { BaseError } from "../domain/errors/base-error";
import type { User } from "../domain/user";

export const TokenPayload = z.object({
  userId: z.string(),
  username: z.string(),
  email: z.string(),
  iat: z.number(),
  exp: z.number(),
});

export type TokenPayload = z.infer<typeof TokenPayload>;

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
}

export class JWTService {
  accessTokenSecret: string;
  accessTokenExpiry: number; // in seconds

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET ||
      "your-access-secret-key";
    this.accessTokenExpiry = parseInt(process.env.JWT_ACCESS_EXPIRY || "86400"); // 24 hours
  }

  async generateAccessToken(user: User): Promise<TokenResponse> {
    const accessToken = await this.createAccessToken(user);

    return {
      accessToken,
      expiresIn: this.accessTokenExpiry,
    };
  }

  private encodeBase64Url(data: object): string {
    return Buffer.from(JSON.stringify(data)).toString("base64url");
  }

  private decodeBase64Url<T>(data: string, schema: z.ZodSchema<T>): T {
    return schema.parse(JSON.parse(Buffer.from(data, "base64url").toString()));
  }

  private async createAccessToken(user: User): Promise<string> {
    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.accessTokenExpiry,
    };

    const header = this.encodeBase64Url({ alg: "HS256", typ: "JWT" });
    const payloadStr = this.encodeBase64Url(payload);
    const signature = await this.createSignature(
      header + "." + payloadStr,
      this.accessTokenSecret,
    );

    return `${header}.${payloadStr}.${signature}`;
  }

  private async createSignature(data: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(data),
    );

    return Buffer.from(signatureBuffer).toString("base64url");
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
        this.accessTokenSecret,
      );
      if (signature !== expectedSignature) {
        throw new JWTInvalidTokenError("Invalid token signature");
      }

      const decodedPayload = this.decodeBase64Url(payload, TokenPayload);

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
}

export class JWTInvalidTokenError extends BaseError {
  constructor(message: string) {
    super(message, 401);
    this.name = "JWTInvalidTokenError";
  }
}

export class JWTTokenExpiredError extends BaseError {
  constructor(message: string) {
    super(message, 401);
    this.name = "JWTTokenExpiredError";
  }
}
