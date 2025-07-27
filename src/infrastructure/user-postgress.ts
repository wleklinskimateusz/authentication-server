import type { UserRepository } from "../domain/user-repository";
import { User } from "../domain/user";
import { sql } from "bun";

export class UserPostgress implements UserRepository {
  async create(user: User): Promise<void> {
    const query = sql`INSERT INTO users (id, username, hashed_password, created_at, updated_at) VALUES (${user.id}, ${user.username}, ${user.hashedPassword}, ${user.createdAt}, ${user.updatedAt})`;
    await query.execute();
  }

  private toUser(
    sqlResponse:
      | [
          [
            id: string,
            email: string,
            hashedPassword: string,
            createdAt: unknown,
            updatedAt: unknown
          ]
        ]
      | undefined
  ): User | null {
    if (!sqlResponse) return null;

    const createdAt = sqlResponse[0][3];
    if (!(createdAt instanceof Date)) {
      console.log(typeof createdAt);
      throw new Error("createdAt is not a Date");
    }

    const updatedAt = sqlResponse[0][4];
    if (!(updatedAt instanceof Date)) {
      console.log(typeof updatedAt);
      throw new Error("updatedAt is not a Date");
    }

    return new User({
      id: sqlResponse[0][0],
      username: sqlResponse[0][1],
      passwordHash: sqlResponse[0][2],
      createdAt: createdAt,
      updatedAt: updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.toUser(
      await sql`SELECT * FROM users WHERE id = ${id}`.values()
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.toUser(
      await sql`SELECT * FROM users WHERE email = ${email}`.values()
    );
  }

  async update(user: User): Promise<void> {
    await sql`UPDATE users SET hashed_password = ${user.hashedPassword}, updated_at = ${user.updatedAt} WHERE id = ${user.id}`.execute();
  }

  async delete(id: string): Promise<void> {
    await sql`DELETE FROM users WHERE id = ${id}`.execute();
  }
}
