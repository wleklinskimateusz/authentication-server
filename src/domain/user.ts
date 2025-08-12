export type User = {
  readonly id: string;
  readonly email: string;
  readonly username: string;
};

export class UserAuth {
  readonly id: string;
  private _email: string;
  private _username: string;
  private _hashedPassword: string;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(params: {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this._email = params.email;
    this._username = params.username;
    this._hashedPassword = params.passwordHash;
    this.createdAt = params.createdAt || new Date();
    this._updatedAt = params.updatedAt || new Date();
  }

  get email() {
    return this._email;
  }
  get username() {
    return this._username;
  }
  get hashedPassword() {
    return this._hashedPassword;
  }
  get updatedAt() {
    return this._updatedAt;
  }

  set hashedPassword(newHashedPassword: string) {
    this._hashedPassword = newHashedPassword;
    this.touch();
  }

  set email(newEmail: string) {
    this._email = newEmail;
    this.touch();
  }

  set username(newUsername: string) {
    this._username = newUsername;
    this.touch();
  }

  private touch() {
    this._updatedAt = new Date();
  }

  toDTO(): User {
    return {
      id: this.id,
      email: this._email,
      username: this._username,
    };
  }
}
