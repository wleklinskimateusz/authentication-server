export class User {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly hashedPassword: string;
  readonly roles: string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    roles?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.username = params.username;
    this.email = params.email;
    this.hashedPassword = params.passwordHash;
    this.roles = params.roles || [];
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return Bun.password.verify(plainPassword, this.hashedPassword);
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      roles: this.roles,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static async create(params: {
    email: string;
    password: string;
    username: string;
    roles?: string[];
  }) {
    const hashedPassword = await Bun.password.hash(params.password);
    const user = new User({
      id: crypto.randomUUID(),
      email: params.email,
      passwordHash: hashedPassword,
      username: params.username,
      roles: params.roles,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return user;
  }
}
