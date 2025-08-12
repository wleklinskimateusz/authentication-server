import { ShouldNotHappenError } from "./error";
import { BaseError } from "./error";
import { describe, it, expect } from "bun:test";

describe("ShouldNotHappenError", () => {
  it("should be an instance of BaseError", () => {
    const error = new ShouldNotHappenError("test");
    expect(error).toBeInstanceOf(BaseError);
  });
});
