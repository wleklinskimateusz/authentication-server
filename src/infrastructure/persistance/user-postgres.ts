import { UserAuth } from "../../domain/user";
import { sql } from "bun";
import type { UserRepository } from "../../application/user.service";
import z from "zod";
import { BasePostgres } from "./base-postgres";

const userRowSchema = z.tuple([
  z.string(), // id
  z.string(), // email
  z.string(), // username
  z.string(), // hashed_password
  z.date(), // created_at
  z.date(), // updated_at
]);

type UserRow = z.infer<typeof userRowSchema>;

export class UserPostgres extends BasePostgres<UserRow, UserAuth>
  implements UserRepository {
  rowSchema = userRowSchema;

  async create(user: UserAuth): Promise<void> {
    const query = sql`
    INSERT INTO users (id, email, username, hashed_password, created_at, updated_at) 
    VALUES (${user.id}, ${user.email}, ${user.username}, ${user.hashedPassword}, ${user.createdAt}, ${user.updatedAt})`;
    await query.execute();
  }

  override toInstance(row: UserRow) {
    return new UserAuth({
      id: row[0],
      email: row[1],
      username: row[2],
      passwordHash: row[3],
      createdAt: row[4],
      updatedAt: row[5],
    });
  }

  async findById(id: string) {
    return this.parseUniqueResponse(
      await sql`SELECT * FROM users WHERE id = ${id}`.values(),
    );
  }

  async findByUsername(username: string) {
    return this.parseUniqueResponse(
      await sql`SELECT * FROM users WHERE username = ${username}`.values(),
    );
  }

  async update(user: UserAuth) {
    await sql`UPDATE users SET hashed_password = ${user.hashedPassword}, updated_at = ${user.updatedAt} WHERE id = ${user.id}`
      .execute();
  }

  async delete(id: string) {
    await sql`DELETE FROM users WHERE id = ${id}`.execute();
  }
}
