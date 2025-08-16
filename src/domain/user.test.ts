import { describe, expect, it, setSystemTime } from "bun:test";
import { UserAuth } from "./user";

describe("User", () => {
  it("should create a user", async () => {
    const user = new UserAuth({
      id: "1",
      email: "test@test.com",
      passwordHash: "password",
      username: "test",
    });
    expect(user.id).toBe("1");
    expect(user.email).toBe("test@test.com");
    expect(user.username).toBe("test");
    expect(user.hashedPassword).toBe("password");
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });
});
