import { describe, expect, it } from "bun:test";
import { User } from "./user";

describe("User", () => {
  it("should create a user", async () => {
    const user = await User.create({
      email: "test@test.com",
      password: "password",
      username: "test",
      roles: [],
    });
    expect(user.id).toBeDefined();
    expect(user.username).toBe("test");
    expect(user.hashedPassword).toBeDefined();
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it("should validate a password", async () => {
    const user = await User.create({
      email: "test@test.com",
      password: "password",
      username: "test",
      roles: [],
    });
    expect(await user.validatePassword("password")).toBe(true);
    expect(await user.validatePassword("wrong_password")).toBe(false);
  });

  it("should return a JSON representation of the user", async () => {
    const user = await User.create({
      email: "test@test.com",
      password: "password",
      username: "test",
    });
    expect(user.toPublic()).toEqual({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  });
});
