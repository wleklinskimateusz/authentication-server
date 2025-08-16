import { BaseError } from "../domain/errors/base-error";
import { UserAuth } from "../domain/user";
import { JWTService } from "./jwt.service";
import type { TokenResponse } from "./jwt.service";
import type { UuidGenerator } from "../domain/services/uuid-generator";
import type { PasswordHasher } from "../domain/services/password-hasher";
import { NotFound } from "../domain/errors/not-found";
import { ResourceAlreadyExists } from "../domain/errors/resource-already-exists";

export interface UserRepository {
  create(user: UserAuth): Promise<void>;
  findById(id: string): Promise<UserAuth | null>;
  findByUsername(username: string): Promise<UserAuth | null>;
  update(user: UserAuth): Promise<void>;
  delete(id: string): Promise<void>;
}

export class UserService {
  private readonly jwtService: JWTService;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly uuidGenerator: UuidGenerator,
    private readonly passwordHasher: PasswordHasher,
  ) {
    this.jwtService = new JWTService();
  }

  async login(username: string, password: string): Promise<TokenResponse> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new NotFound(`User with username ${username} not found`);
    }
    const isValid = await this.validatePassword(password, user.hashedPassword);
    if (!isValid) {
      throw new UserInvalidPasswordError(
        `Invalid password for user ${username}`,
      );
    }

    return this.jwtService.generateAccessToken(user.toDTO());
  }

  async register(username: string, password: string) {
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new ResourceAlreadyExists(
        `User with username ${username} already exists`,
      );
    }
    await this.userRepository.create(
      await this.createUser({
        email: `${username}@example.com`,
        username,
        password,
      }),
    );
  }

  async createUser(params: {
    email: string;
    username: string;
    password: string;
  }): Promise<UserAuth> {
    const id = this.uuidGenerator.generate();
    const hashedPassword = await this.passwordHasher.hash(params.password);

    return new UserAuth({
      id,
      email: params.email,
      username: params.username,
      passwordHash: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await this.passwordHasher.verify(password, hashedPassword);
  }

  async verifyAccessToken(token: string) {
    return await this.jwtService.verifyAccessToken(token);
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFound(`User with id ${id} not found`);
    }
    await this.userRepository.delete(id);
  }

  async updateUser(
    id: string,
    params: Partial<{
      email: string;
      username: string;
      password: string;
    }>,
  ): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFound(`User with id ${id} not found`);
    }
    if (params.email) {
      user.email = params.email;
    }
    if (params.username) {
      user.username = params.username;
    }
    if (params.password) {
      user.hashedPassword = await this.passwordHasher.hash(params.password);
    }
    await this.userRepository.update(user);
  }
}

export class UserInvalidPasswordError extends BaseError {
  constructor(message: string) {
    super(message, 401);
    this.name = "UserInvalidPasswordError";
  }
}
