import type { UuidGenerator as UuidGeneratorInterface } from "../../domain/services/uuid-generator";

export class UuidGenerator implements UuidGenerator {
  constructor() {}

  generate(): string {
    return crypto.randomUUID();
  }
}
