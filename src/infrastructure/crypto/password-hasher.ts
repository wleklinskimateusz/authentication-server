import { BaseError } from "../../domain/errors/base-error";
import { ShouldNotHappenError } from "../../domain/errors/should-not-happen-error";
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

  private validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return Bun.password.verify(password, hashedPassword);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    try {
      return await this.validatePassword(password, hash);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new ShouldNotHappenError(
          `Unexpected error type: ${typeof error}`,
        );
      }
      throw new PasswordHashError(
        `Password verification failed: ${error.message}`,
      );
    }
  }
}
