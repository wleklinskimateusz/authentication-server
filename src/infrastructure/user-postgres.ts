import { UserAuth } from "../domain/user";
import { sql } from "bun";
import type { UserRepository } from "../application/user.service";
import { ShouldNotHappenError } from "../common/error";
import z from "zod";

export class UserPostgres implements UserRepository {
  async create(user: UserAuth): Promise<void> {
    const query = sql`
    INSERT INTO users (id, email, username, hashed_password, created_at, updated_at) 
    VALUES (${user.id}, ${user.email}, ${user.username}, ${user.hashedPassword}, ${user.createdAt}, ${user.updatedAt})`;
    await query.execute();
  }

  private toUser(sqlResponse: undefined) {
    const schema = z.union([
      z.tuple([
        z.tuple([
          z.string(),
          z.string(),
          z.string(),
          z.string(),
          z.date(),
          z.date(),
        ]),
      ]),
      z.tuple([]),
    ]);
    const parsed = schema.safeParse(sqlResponse);

    if (!parsed.success) {
      throw new ShouldNotHappenError(
        "Invalid SQL response: " + JSON.stringify(parsed.error)
      );
    }

    if (parsed.data.length === 0) {
      return null;
    }

    const [id, email, username, passwordHash, createdAt, updatedAt] =
      parsed.data[0]!;

    return new UserAuth({
      id,
      email,
      username,
      passwordHash,
      createdAt,
      updatedAt,
      permissionGroups: [],
    });
  }

  async findById(id: string) {
    return this.toUser(
      await sql`SELECT * FROM users WHERE id = ${id}`.values()
    );
  }

  async findByUsername(username: string) {
    return this.toUser(
      await sql`SELECT * FROM users WHERE username = ${username}`.values()
    );
  }

  async update(user: UserAuth) {
    await sql`UPDATE users SET hashed_password = ${user.hashedPassword}, updated_at = ${user.updatedAt} WHERE id = ${user.id}`.execute();
  }

  async delete(id: string) {
    await sql`DELETE FROM users WHERE id = ${id}`.execute();
  }
}
