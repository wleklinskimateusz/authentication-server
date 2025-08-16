import { beforeEach, describe, expect, it, mock } from "bun:test";
import { AuthController } from "./auth.controller";
import {
  UserInvalidPasswordError,
  UserService,
} from "../application/user.service";
import type { TokenResponse } from "../application/jwt.service";
import { NotFound } from "../domain/errors/not-found";
import { ResourceAlreadyExists } from "../domain/errors/resource-already-exists";
import { InvalidRequestBodyError } from "./base-controller";

// Simple mock for testing
const createMockUserService = () => ({
  login: mock(() =>
    Promise.resolve({ accessToken: "mock-token", expiresIn: 86400 })
  ),
  register: mock(() => Promise.resolve()),
});

describe("UserController", () => {
  let userController: AuthController;
  let mockUserService: ReturnType<typeof createMockUserService>;

  beforeEach(() => {
    mockUserService = createMockUserService();
    userController = new AuthController(
      mockUserService as unknown as UserService,
    );
  });

  describe("login", () => {
    it("should return 200 with token on successful login", async () => {
      const token = {
        accessToken: "mock-token",
        expiresIn: 86400,
      };
      mockUserService.login.mockResolvedValue(token);

      const request = new Request("http://localhost/login", {
        method: "POST",
        body: JSON.stringify({ username: "testuser", password: "password123" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await userController.login(request);
      const body = (await response.json()) as TokenResponse;

      expect(response.status).toBe(200);

      expect(body).toEqual(token);
      expect(mockUserService.login).toHaveBeenCalledWith(
        "testuser",
        "password123",
      );
    });

    it("should return 400 for invalid request body", async () => {
      const request = new Request("http://localhost/login", {
        method: "POST",
        body: JSON.stringify({ username: "testuser" }), // missing password
        headers: { "Content-Type": "application/json" },
      });

      expect(userController.login(request)).rejects.toThrow(
        InvalidRequestBodyError,
      );
    });

    it("should return 401 for invalid credentials", async () => {
      const authError = new UserInvalidPasswordError("Invalid credentials");
      mockUserService.login.mockRejectedValue(authError);

      const request = new Request("http://localhost/login", {
        method: "POST",
        body: JSON.stringify({
          username: "testuser",
          password: "wrongpassword",
        }),
        headers: { "Content-Type": "application/json" },
      });

      expect(userController.login(request)).rejects.toThrow(
        UserInvalidPasswordError,
      );
    });

    it("should return 404 for user not found", async () => {
      const notFoundError = new NotFound("User not found");
      mockUserService.login.mockRejectedValue(notFoundError);

      const request = new Request("http://localhost/login", {
        method: "POST",
        body: JSON.stringify({
          username: "nonexistent",
          password: "password123",
        }),
        headers: { "Content-Type": "application/json" },
      });

      expect(userController.login(request)).rejects.toThrow(NotFound);
    });
  });

  describe("register", () => {
    it("should return 201 on successful registration", async () => {
      mockUserService.register.mockResolvedValue(undefined);

      const request = new Request("http://localhost/register", {
        method: "POST",
        body: JSON.stringify({ username: "newuser", password: "password123" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await userController.register(request);
      const body = (await response.json()) as { message: string };

      expect(response.status).toBe(201);
      expect(body.message).toBe("User registered");
      expect(mockUserService.register).toHaveBeenCalledWith(
        "newuser",
        "password123",
      );
    });

    it("should return 400 for invalid request body", async () => {
      const request = new Request("http://localhost/register", {
        method: "POST",
        body: JSON.stringify({ username: "newuser" }), // missing password
        headers: { "Content-Type": "application/json" },
      });
      expect(userController.register(request)).rejects.toThrow(
        InvalidRequestBodyError,
      );
    });

    it("should return 409 for user already exists", async () => {
      const existsError = new ResourceAlreadyExists("User already exists");
      mockUserService.register.mockRejectedValue(existsError);

      const request = new Request("http://localhost/register", {
        method: "POST",
        body: JSON.stringify({
          username: "existinguser",
          password: "password123",
        }),
        headers: { "Content-Type": "application/json" },
      });

      expect(userController.register(request)).rejects.toThrow(
        ResourceAlreadyExists,
      );
    });
  });

  describe("HTTP response formatting", () => {
    it("should set correct content-type header", async () => {
      mockUserService.login.mockResolvedValue({
        accessToken: "mock-token",
        expiresIn: 86400,
      });

      const request = new Request("http://localhost/login", {
        method: "POST",
        body: JSON.stringify({ username: "testuser", password: "password123" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await userController.login(request);

      expect(response.headers.get("content-type")).toContain(
        "application/json",
      );
    });

    it("should handle empty request body", async () => {
      const request = new Request("http://localhost/login", {
        method: "POST",
        body: "",
        headers: { "Content-Type": "application/json" },
      });

      expect(userController.login(request)).rejects.toThrow(
        InvalidRequestBodyError,
      );
    });

    it("should handle malformed JSON", async () => {
      const request = new Request("http://localhost/login", {
        method: "POST",
        body: '{"username": "testuser", "password": "password123"', // missing closing brace
        headers: { "Content-Type": "application/json" },
      });

      expect(userController.login(request)).rejects.toThrow(
        InvalidRequestBodyError,
      );
    });
  });

  describe("registerRoutes", () => {
    it("should return the correct routes", () => {
      const routes = userController.registerRoutes();
      expect(routes.path).toBe("/auth");
      expect(routes.routes.length).toBe(2);
    });
  });
});
