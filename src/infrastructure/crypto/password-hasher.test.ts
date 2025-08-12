import { describe, expect, it } from "bun:test";
import { PasswordHasher, PasswordHashError } from "./password-hasher";

describe("PasswordHasher", () => {
  it("should hash a password", async () => {
    const passwordHasher = new PasswordHasher();
    const password = "password";
    const hashedPassword = await passwordHasher.hash(password);
    expect(hashedPassword).toBeDefined();
  });

  it("should verify a password", async () => {
    const passwordHasher = new PasswordHasher();
    const password = "password";
    const hashedPassword = await passwordHasher.hash(password);
    const isValid = await passwordHasher.verify(password, hashedPassword);
    expect(isValid).toBe(true);
  });

  it("should return false if the password is incorrect", async () => {
    const passwordHasher = new PasswordHasher();
    const password = "password";
    const hashedPassword = await passwordHasher.hash(password);
    const isValid = await passwordHasher.verify(
      "wrongpassword",
      hashedPassword
    );
    expect(isValid).toBe(false);
  });

  it("should throw an error if the hash is invalid", async () => {
    const passwordHasher = new PasswordHasher();
    try {
      await passwordHasher.verify("wrongpassword", "wronghash");
      throw new Error("Should not reach this line");
    } catch (error) {
      expect(error).toBeInstanceOf(PasswordHashError);
    }
  });
});
