import { describe, it, expect, beforeEach } from "bun:test";
import {
  JWTService,
  JWTInvalidTokenError,
  JWTTokenExpiredError,
} from "./jwt.service";
import type { User } from "../domain/user";

describe("JWTService", () => {
  let jwtService: JWTService;
  let mockUser: User;

  beforeEach(() => {
    jwtService = new JWTService();
    mockUser = {
      id: "user-123",
      username: "testuser",
      email: "test@example.com",
      permissionGroups: ["user"],
    };
  });

  describe("generateAccessToken", () => {
    it("should generate access token", async () => {
      const tokenResponse = await jwtService.generateAccessToken(mockUser);

      expect(tokenResponse.accessToken).toBeDefined();
      expect(tokenResponse.expiresIn).toBe(86400); // 24 hours
    });

    it("should generate different tokens for different users", async () => {
      const user1 = { ...mockUser, id: "user-1", username: "user1" };
      const user2 = { ...mockUser, id: "user-2", username: "user2" };

      const tokenResponse1 = await jwtService.generateAccessToken(user1);
      const tokenResponse2 = await jwtService.generateAccessToken(user2);

      expect(tokenResponse1.accessToken).not.toBe(tokenResponse2.accessToken);
    });

    it("should generate token with correct structure", async () => {
      const tokenResponse = await jwtService.generateAccessToken(mockUser);

      // Check that token has the JWT structure (header.payload.signature)
      expect(tokenResponse.accessToken.split(".")).toHaveLength(3);
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify a valid access token", async () => {
      const tokenResponse = await jwtService.generateAccessToken(mockUser);
      const payload = await jwtService.verifyAccessToken(
        tokenResponse.accessToken
      );

      expect(payload.userId).toBe(mockUser.id);
      expect(payload.username).toBe(mockUser.username);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.permissionGroups).toEqual(mockUser.permissionGroups);
    });

    it("should throw JWTInvalidTokenError for invalid token format", async () => {
      await expect(
        jwtService.verifyAccessToken("invalid.token")
      ).rejects.toThrow(JWTInvalidTokenError);
    });

    it("should throw JWTInvalidTokenError for malformed token", async () => {
      await expect(
        jwtService.verifyAccessToken("header.payload")
      ).rejects.toThrow(JWTInvalidTokenError);
    });

    it("should throw JWTInvalidTokenError for invalid signature", async () => {
      const tokenResponse = await jwtService.generateAccessToken(mockUser);
      const tamperedToken =
        tokenResponse.accessToken.slice(0, -10) + "tampered";

      await expect(jwtService.verifyAccessToken(tamperedToken)).rejects.toThrow(
        JWTInvalidTokenError
      );
    });

    it("should throw JWTTokenExpiredError for expired token", async () => {
      // Create a token with an expired timestamp
      const expiredPayload = {
        userId: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        permissionGroups: mockUser.permissionGroups,
        iat: Math.floor(Date.now() / 1000) - 86400, // 24 hours ago
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago (expired)
      };

      // Create the expired token manually
      const header = Buffer.from(
        JSON.stringify({ alg: "HS256", typ: "JWT" })
      ).toString("base64");
      const payloadStr = Buffer.from(JSON.stringify(expiredPayload)).toString(
        "base64"
      );

      // Create signature for the expired token
      const encoder = new TextEncoder();
      const keyData = encoder.encode(jwtService["accessTokenSecret"]);
      const messageData = encoder.encode(header + "." + payloadStr);

      const key = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signature = await crypto.subtle.sign("HMAC", key, messageData);
      const signatureStr = Buffer.from(signature).toString("base64");

      const expiredToken = `${header}.${payloadStr}.${signatureStr}`;

      // Verify that the expired token throws the correct error
      await expect(jwtService.verifyAccessToken(expiredToken)).rejects.toThrow(
        JWTTokenExpiredError
      );
      await expect(jwtService.verifyAccessToken(expiredToken)).rejects.toThrow(
        "Access token has expired"
      );
    });
  });

  describe("extractTokenFromHeader", () => {
    it("should extract token from valid Authorization header", () => {
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const authHeader = `Bearer ${token}`;

      const extractedToken = jwtService.extractTokenFromHeader(authHeader);
      expect(extractedToken).toBe(token);
    });

    it("should return null for missing Authorization header", () => {
      const extractedToken = jwtService.extractTokenFromHeader(null);
      expect(extractedToken).toBeNull();
    });

    it("should return null for invalid Authorization header format", () => {
      const extractedToken = jwtService.extractTokenFromHeader(
        "InvalidFormat token"
      );
      expect(extractedToken).toBeNull();
    });

    it("should return null for Authorization header without Bearer", () => {
      const extractedToken = jwtService.extractTokenFromHeader("token");
      expect(extractedToken).toBeNull();
    });

    it("should return null for empty token", () => {
      const extractedToken = jwtService.extractTokenFromHeader("Bearer ");
      expect(extractedToken).toBeNull();
    });
  });

  describe("getTokenExpirationTime", () => {
    it("should return future expiration time", () => {
      const expirationTime = jwtService.getTokenExpirationTime();
      const now = new Date();

      expect(expirationTime.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe("isTokenNearExpiry", () => {
    it("should return false for valid token", async () => {
      const tokenResponse = await jwtService.generateAccessToken(mockUser);
      const isNearExpiry = await jwtService.isTokenNearExpiry(
        tokenResponse.accessToken
      );

      expect(isNearExpiry).toBe(false);
    });

    it("should return true for invalid token", async () => {
      const isNearExpiry = await jwtService.isTokenNearExpiry("invalid.token");

      expect(isNearExpiry).toBe(true);
    });
  });

  describe("decodeTokenWithoutVerification", () => {
    it("should decode valid token structure", () => {
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const payload = jwtService.decodeTokenWithoutVerification(token);

      expect(payload).toBeDefined();
    });

    it("should return null for invalid token format", () => {
      const payload =
        jwtService.decodeTokenWithoutVerification("invalid.token");
      expect(payload).toBeNull();
    });

    it("should return null for malformed token", () => {
      const payload =
        jwtService.decodeTokenWithoutVerification("header.payload");
      expect(payload).toBeNull();
    });
  });

  describe("token payload structure", () => {
    it("should include all required fields in access token", async () => {
      const tokenResponse = await jwtService.generateAccessToken(mockUser);
      const payload = await jwtService.verifyAccessToken(
        tokenResponse.accessToken
      );

      expect(payload).toHaveProperty("userId");
      expect(payload).toHaveProperty("username");
      expect(payload).toHaveProperty("email");
      expect(payload).toHaveProperty("permissionGroups");
      expect(payload).toHaveProperty("iat");
      expect(payload).toHaveProperty("exp");
    });
  });

  describe("error handling", () => {
    it("should handle JSON parsing errors gracefully", async () => {
      const invalidToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.base64.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      await expect(jwtService.verifyAccessToken(invalidToken)).rejects.toThrow(
        JWTInvalidTokenError
      );
    });

    it("should handle base64 decoding errors gracefully", async () => {
      const invalidToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.!!!.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      await expect(jwtService.verifyAccessToken(invalidToken)).rejects.toThrow(
        JWTInvalidTokenError
      );
    });
  });
});
