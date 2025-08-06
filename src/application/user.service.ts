import { BaseError } from "../common/error";
import { UserAuth } from "../domain/user";
import { JWTService } from "./jwt.service";
import type { TokenResponse } from "./jwt.service";

export interface UserRepository {
  create(user: UserAuth): Promise<void>;
  findById(id: string): Promise<UserAuth | null>;
  findByUsername(username: string): Promise<UserAuth | null>;
  update(user: UserAuth): Promise<void>;
  delete(id: string): Promise<void>;
}

export class UserAlreadyExistsError extends BaseError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UserNotFoundError extends BaseError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class UserInvalidPasswordError extends BaseError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class UserService {
  private readonly jwtService: JWTService;

  constructor(private readonly userRepository: UserRepository) {
    this.jwtService = new JWTService();
  }

  async login(username: string, password: string): Promise<TokenResponse> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new UserNotFoundError(`User with username ${username} not found`);
    }
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      throw new UserInvalidPasswordError(
        `Invalid password for user ${username}`
      );
    }

    return this.jwtService.generateAccessToken(user.toDTO());
  }

  async register(username: string, password: string) {
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new UserAlreadyExistsError(
        `User with username ${username} already exists`
      );
    }
    await this.userRepository.create(
      await UserAuth.create({
        email: `${username}@example.com`,
        username,
        password,
        permissionGroups: [],
      })
    );
  }

  async verifyAccessToken(token: string) {
    return await this.jwtService.verifyAccessToken(token);
  }
}
