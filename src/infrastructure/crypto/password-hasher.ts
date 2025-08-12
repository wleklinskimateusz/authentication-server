import { BaseError } from "../../common/error";
import type { PasswordHasher as PasswordHasherInterface } from "../../domain/services/password-hasher";

export class PasswordHashError extends BaseError {
  constructor(message: string) {
    super(message, 500);
  }
}

export class PasswordHasher implements PasswordHasherInterface {
  constructor() {}

  hash(password: string): Promise<string> {
    return Bun.password.hash(password);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    try {
      return await Bun.password.verify(password, hash);
    } catch (error) {
      console.error(error);
      throw new PasswordHashError("Failed to verify password");
    }
  }
}
