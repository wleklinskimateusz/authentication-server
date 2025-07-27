import type { UserRepository } from "../domain/user-repository";
import { User } from "../domain/user";
import { sql } from "bun";

export class UserPostgress implements UserRepository {
  async create(user: User): Promise<void> {
    const query = sql`INSERT INTO users (id, email, hashed_password, created_at, updated_at) VALUES (${user.id}, ${user.email}, ${user.hashedPassword}, ${user.createdAt}, ${user.updatedAt})`;
  }

  async findById(id: string): Promise<User | null> {
    const query = sql`SELECT * FROM users WHERE id = ${id}`;
    const result = await query.execute();
    return result ? new User(result) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = sql`SELECT * FROM users WHERE email = ${email}`;
    const result = await query.execute();
    return result ? new User(result) : null;
  }

  async update(user: User): Promise<void> {
    const query = sql`UPDATE users SET email = ${user.email}, hashed_password = ${user.hashedPassword}, updated_at = ${user.updatedAt} WHERE id = ${user.id}`;
    await query.execute();
  }

  async delete(id: string): Promise<void> {
    const query = sql`DELETE FROM users WHERE id = ${id}`;
    await query.execute();
  }
}
