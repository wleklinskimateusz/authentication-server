import { describe, expect, it } from "bun:test";
import { UserAuth } from "./user";

describe("User", () => {
  it("should create a user", async () => {
    const user = await UserAuth.create({
      email: "test@test.com",
      password: "password",
      username: "test",
      permissionGroups: [],
    });
    expect(user.id).toBeDefined();
    expect(user.username).toBe("test");
    expect(user.hashedPassword).toBeDefined();
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it("should validate a password", async () => {
    const user = await UserAuth.create({
      email: "test@test.com",
      password: "password",
      username: "test",
      permissionGroups: [],
    });
    expect(await user.validatePassword("password")).toBe(true);
    expect(await user.validatePassword("wrong_password")).toBe(false);
  });

  it("should return a DTO of the user", async () => {
    const user = await UserAuth.create({
      email: "test@test.com",
      password: "password",
      username: "test",
      permissionGroups: [],
    });
    expect(user.toDTO()).toEqual({
      id: user.id,
      username: user.username,
      email: user.email,
      permissionGroups: [],
    });
  });
});
