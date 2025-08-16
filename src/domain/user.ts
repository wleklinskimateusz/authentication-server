export type User = {
  readonly id: string;
  readonly email: string;
  readonly username: string;
};

export class UserAuth {
  readonly id: string;
  email: string;
  username: string;
  hashedPassword: string;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.email = params.email;
    this.username = params.username;
    this.hashedPassword = params.passwordHash;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  toDTO(): User {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
    };
  }
}
