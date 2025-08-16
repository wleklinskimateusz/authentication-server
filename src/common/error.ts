export abstract class BaseError extends Error {
  public readonly statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class ShouldNotHappenError extends BaseError {
  constructor(message: string) {
    super(message, 500);
    this.name = "ShouldNotHappenError";
  }
}
