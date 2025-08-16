import { describe, expect, it } from "bun:test";
import { PasswordHasher, PasswordHashError } from "./password-hasher";
import { ShouldNotHappenError } from "../../domain/errors/should-not-happen-error";

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
      hashedPassword,
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

  it("should throw an error if the password verification fails due to an unknown error", async () => {
    const passwordHasher = new PasswordHasher();

    expect(passwordHasher.verify("password", "12345")).rejects.toThrow(
      PasswordHashError,
    );
  });

  it("should throw should not happen error for unexpected error types", async () => {
    const passwordHasher = new PasswordHasher();
    passwordHasher["validatePassword"] = async () => {
      throw "Unexpected error type";
    };

    expect(
      passwordHasher.verify("password", "hashedPassword"),
    ).rejects.toThrow(ShouldNotHappenError);
  });
});
