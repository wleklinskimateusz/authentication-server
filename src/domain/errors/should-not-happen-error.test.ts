import { ShouldNotHappenError } from "./should-not-happen-error";
import { BaseError } from "./base-error";
import { describe, expect, it } from "bun:test";

describe("ShouldNotHappenError", () => {
  it("should be an instance of BaseError", () => {
    const error = new ShouldNotHappenError("test");
    expect(error).toBeInstanceOf(BaseError);
  });
});
