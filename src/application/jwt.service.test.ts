import { describe, it, expect, beforeEach, jest } from "bun:test";
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
    };
  });

  describe("constructor", () => {
    it("should create a JWTService instance with default values", () => {
      const jwtService = new JWTService();

      expect(jwtService).toBeInstanceOf(JWTService);
      expect(jwtService.accessTokenExpiry).toBe(86400);
      expect(jwtService.accessTokenSecret).toBe("your-access-secret-key");
    });
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
    });

    it("should throw JWTInvalidTokenError for invalid token format", async () => {
      expect(jwtService.verifyAccessToken("invalid.token")).rejects.toThrow(
        JWTInvalidTokenError
      );
    });

    it("should throw JWTInvalidTokenError for malformed token", async () => {
      expect(jwtService.verifyAccessToken("header.payload")).rejects.toThrow(
        JWTInvalidTokenError
      );
    });

    it("should throw JWTInvalidTokenError for invalid signature", async () => {
      const tokenResponse = await jwtService.generateAccessToken(mockUser);
      const tamperedToken =
        tokenResponse.accessToken.slice(0, -10) + "tampered";

      expect(jwtService.verifyAccessToken(tamperedToken)).rejects.toThrow(
        JWTInvalidTokenError
      );
    });

    it("should throw JWTTokenExpiredError for expired token", async () => {
      const pastDate = Date.now() - 1000 * 60 * 60 * 24;
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => pastDate); // 2024-06-10T00:00:00.000Z

      const tokenResponse = await jwtService.generateAccessToken(mockUser);

      Date.now = originalDateNow;

      expect(
        jwtService.verifyAccessToken(tokenResponse.accessToken)
      ).rejects.toThrow(JWTTokenExpiredError);
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

  describe("token payload structure", () => {
    it("should include all required fields in access token", async () => {
      const tokenResponse = await jwtService.generateAccessToken(mockUser);
      const payload = await jwtService.verifyAccessToken(
        tokenResponse.accessToken
      );

      expect(payload).toHaveProperty("userId");
      expect(payload).toHaveProperty("username");
      expect(payload).toHaveProperty("email");
      expect(payload).toHaveProperty("iat");
      expect(payload).toHaveProperty("exp");
    });
  });

  describe("error handling", () => {
    it("should handle JSON parsing errors gracefully", async () => {
      const invalidToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.base64.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      expect(jwtService.verifyAccessToken(invalidToken)).rejects.toThrow(
        JWTInvalidTokenError
      );
    });

    it("should handle base64 decoding errors gracefully", async () => {
      const invalidToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.!!!.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

      expect(jwtService.verifyAccessToken(invalidToken)).rejects.toThrow(
        JWTInvalidTokenError
      );
    });
  });
});
