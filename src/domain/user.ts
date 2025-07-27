export class User {
  readonly id: string;
  readonly username: string;
  readonly hashedPassword: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: {
    id: string;
    username: string;
    passwordHash: string;
    roles?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.username = params.username;
    this.hashedPassword = params.passwordHash;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return Bun.password.verify(plainPassword, this.hashedPassword);
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
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
      passwordHash: hashedPassword,
      username: params.username,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return user;
  }
}
