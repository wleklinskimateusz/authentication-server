import { describe, it, expect, beforeEach, mock } from "bun:test";
import {
  UserService,
  UserAlreadyExistsError,
  UserNotFoundError,
  UserInvalidPasswordError,
} from "./user.service";
import type { UserRepository } from "./user.service";
import { UserAuth } from "../domain/user";

// Mock repository for testing
class MockUserRepository implements UserRepository {
  private users: Map<string, UserAuth> = new Map();

  async create(user: UserAuth): Promise<void> {
    this.users.set(user.id, user);
  }

  async findById(id: string): Promise<UserAuth | null> {
    return this.users.get(id) || null;
  }

  async findByUsername(username: string): Promise<UserAuth | null> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return null;
  }

  async update(user: UserAuth): Promise<void> {
    this.users.set(user.id, user);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  // Helper method for testing
  clear() {
    this.users.clear();
  }
}

describe("UserService", () => {
  let userService: UserService;
  let mockRepository: MockUserRepository;

  beforeEach(() => {
    mockRepository = new MockUserRepository();
    userService = new UserService(mockRepository);
  });

  describe("register", () => {
    it("should successfully register a new user", async () => {
      const username = "testuser";
      const password = "password123";

      await userService.register(username, password);

      const createdUser = await mockRepository.findByUsername(username);
      expect(createdUser).not.toBeNull();
      expect(createdUser?.username).toBe(username);
      expect(createdUser?.email).toBe(`${username}@example.com`);
      expect(createdUser?.permissionGroups).toEqual([]);

      // Verify password was hashed
      const isValidPassword = await createdUser!.validatePassword(password);
      expect(isValidPassword).toBe(true);
    });

    it("should throw UserAlreadyExistsError when username already exists", async () => {
      const username = "existinguser";
      const password = "password123";

      // Create first user
      await userService.register(username, password);

      // Try to register same username again
      expect(userService.register(username, password)).rejects.toThrow(
        UserAlreadyExistsError
      );
      expect(userService.register(username, password)).rejects.toThrow(
        `User with username ${username} already exists`
      );
    });

    it("should create user with correct email format", async () => {
      const username = "testuser";
      const password = "password123";

      await userService.register(username, password);

      const createdUser = await mockRepository.findByUsername(username);
      expect(createdUser?.email).toBe(`${username}@example.com`);
    });

    it("should create user with empty permission groups", async () => {
      const username = "testuser";
      const password = "password123";

      await userService.register(username, password);

      const createdUser = await mockRepository.findByUsername(username);
      expect(createdUser?.permissionGroups).toEqual([]);
    });

    it("should generate unique IDs for different users", async () => {
      const username1 = "user1";
      const username2 = "user2";
      const password = "password123";

      await userService.register(username1, password);
      await userService.register(username2, password);

      const user1 = await mockRepository.findByUsername(username1);
      const user2 = await mockRepository.findByUsername(username2);

      expect(user1?.id).not.toBe(user2?.id);
      expect(user1?.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
      expect(user2?.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });
  });

  describe("login", () => {
    it("should successfully login with correct credentials", async () => {
      const username = "testuser";
      const password = "password123";

      // Register user first
      await userService.register(username, password);

      // Login with correct credentials
      const token = await userService.login(username, password);

      expect(token).not.toBeNull();
      expect(token.accessToken).not.toBeNull();
      expect(token.expiresIn).not.toBeNull();
    });

    it("should throw UserNotFoundError when username does not exist", async () => {
      const username = "nonexistentuser";
      const password = "password123";

      expect(userService.login(username, password)).rejects.toThrow(
        UserNotFoundError
      );
      expect(userService.login(username, password)).rejects.toThrow(
        `User with username ${username} not found`
      );
    });

    it("should throw UserInvalidPasswordError when password is incorrect", async () => {
      const username = "testuser";
      const correctPassword = "password123";
      const wrongPassword = "wrongpassword";

      // Register user with correct password
      await userService.register(username, correctPassword);

      // Try to login with wrong password
      expect(userService.login(username, wrongPassword)).rejects.toThrow(
        UserInvalidPasswordError
      );
      expect(userService.login(username, wrongPassword)).rejects.toThrow(
        `Invalid password for user ${username}`
      );
    });

    it("should handle case-sensitive username matching", async () => {
      const username = "TestUser";
      const password = "password123";

      await userService.register(username, password);

      // Should not find user with different case
      expect(userService.login("testuser", password)).rejects.toThrow(
        UserNotFoundError
      );
      expect(userService.login("TESTUSER", password)).rejects.toThrow(
        UserNotFoundError
      );
    });
  });

  describe("error handling", () => {
    it("should propagate repository errors", async () => {
      const failingRepository: UserRepository = {
        create: mock(() =>
          Promise.reject(new Error("Database connection failed"))
        ),
        findById: mock(() => Promise.resolve(null)),
        findByUsername: mock(() => Promise.resolve(null)),
        update: mock(() => Promise.resolve(undefined)),
        delete: mock(() => Promise.resolve(undefined)),
      };

      const serviceWithFailingRepo = new UserService(failingRepository);

      expect(
        serviceWithFailingRepo.register("testuser", "password")
      ).rejects.toThrow("Database connection failed");
    });

    it("should handle repository returning null for findByUsername", async () => {
      const nullRepository: UserRepository = {
        create: mock(() => Promise.resolve(undefined)),
        findById: mock(() => Promise.resolve(null)),
        findByUsername: mock(() => Promise.resolve(null)),
        update: mock(() => Promise.resolve(undefined)),
        delete: mock(() => Promise.resolve(undefined)),
      };

      const serviceWithNullRepo = new UserService(nullRepository);

      expect(serviceWithNullRepo.login("testuser", "password")).rejects.toThrow(
        UserNotFoundError
      );
    });
  });

  describe("password validation", () => {
    it("should correctly validate hashed passwords", async () => {
      const username = "testuser";
      const password = "complexPassword123!@#";

      await userService.register(username, password);
      const user = await mockRepository.findByUsername(username);

      expect(user).not.toBeNull();

      // Test correct password
      const isValidCorrect = await user!.validatePassword(password);
      expect(isValidCorrect).toBe(true);

      // Test incorrect password
      const isValidIncorrect = await user!.validatePassword("wrongpassword");
      expect(isValidIncorrect).toBe(false);
    });

    it("should handle special characters in passwords", async () => {
      const username = "testuser";
      const password = "!@#$%^&*()_+-=[]{}|;:,.<>?";

      await userService.register(username, password);
      const user = await mockRepository.findByUsername(username);

      expect(user).not.toBeNull();
      const isValid = await user!.validatePassword(password);
      expect(isValid).toBe(true);
    });
  });

  describe("JWT token verification", () => {
    it("should call verifyAccessToken with correct token", async () => {
      const testToken = "test.jwt.token";
      const expectedPayload = {
        userId: "user-123",
        username: "testuser",
        email: "test@example.com",
        permissionGroups: ["user"],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      // Mock the JWT service's verifyAccessToken method
      const mockVerifyAccessToken = mock(() =>
        Promise.resolve(expectedPayload)
      );
      userService["jwtService"].verifyAccessToken = mockVerifyAccessToken;

      // Call the verifyAccessToken method
      const result = await userService.verifyAccessToken(testToken);

      // Verify the method was called with the correct token
      expect(mockVerifyAccessToken).toHaveBeenCalledWith(testToken);
      expect(mockVerifyAccessToken).toHaveBeenCalledTimes(1);

      // Verify the result is correct
      expect(result).toEqual(expectedPayload);
    });

    it("should propagate JWT verification errors", async () => {
      const testToken = "invalid.jwt.token";
      const jwtError = new Error("Invalid JWT token");

      // Mock the JWT service to throw an error
      const mockVerifyAccessToken = mock(() => Promise.reject(jwtError));
      userService["jwtService"].verifyAccessToken = mockVerifyAccessToken;

      // Verify the error is propagated
      await expect(userService.verifyAccessToken(testToken)).rejects.toThrow(
        "Invalid JWT token"
      );
      expect(mockVerifyAccessToken).toHaveBeenCalledWith(testToken);
      expect(mockVerifyAccessToken).toHaveBeenCalledTimes(1);
    });
  });
});
