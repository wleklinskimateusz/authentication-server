import { describe, expect, it } from "bun:test";
import { UuidGenerator } from "./uuid";

describe("UuidGenerator", () => {
  it("should generate a valid uuid", () => {
    const uuidGenerator = new UuidGenerator();
    const uuid = uuidGenerator.generate();
    expect(uuid).toBeDefined();
  });
});
