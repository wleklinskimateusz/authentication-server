export type User = {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly permissionGroups: string[];
};

export class UserAuth {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly hashedPassword: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly permissionGroups: string[];

  constructor(params: {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    createdAt?: Date;
    updatedAt?: Date;
    permissionGroups: string[];
  }) {
    this.id = params.id;
    this.email = params.email;
    this.username = params.username;
    this.hashedPassword = params.passwordHash;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
    this.permissionGroups = params.permissionGroups;
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return Bun.password.verify(plainPassword, this.hashedPassword);
  }

  toDTO() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      permissionGroups: this.permissionGroups,
    } satisfies User;
  }

  static async create(params: {
    email: string;
    password: string;
    username: string;
    permissionGroups: string[];
  }) {
    const hashedPassword = await Bun.password.hash(params.password);
    const user = new UserAuth({
      id: crypto.randomUUID(),
      passwordHash: hashedPassword,
      username: params.username,
      email: params.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissionGroups: params.permissionGroups,
    });
    return user;
  }
}
