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

  it("should update a user", async () => {
    setSystemTime(new Date(Date.UTC(2025, 0, 1, 0, 0, 0, 0)));
    const user = new UserAuth({
      id: "1",
      email: "test@test.com",
      passwordHash: "password",
      username: "test",
    });
    const updatedAt = user.updatedAt;
    setSystemTime(new Date(Date.UTC(2025, 0, 1, 0, 0, 0, 500)));
    user.email = "test2@test.com";
    user.username = "test2";
    user.hashedPassword = "password2";
    expect(user.email).toBe("test2@test.com");
    expect(user.username).toBe("test2");
    expect(user.hashedPassword).toBe("password2");
    expect(user.updatedAt.getTime()).toBeGreaterThan(updatedAt.getTime());
  });
});
