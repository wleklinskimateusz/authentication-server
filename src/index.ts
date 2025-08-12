import { UserService } from "./application/user.service";
import { UserPostgres } from "./infrastructure/persistance/user-postgres";
import { AuthController } from "./interfaces/auth.controller";

import { Server } from "./infrastructure/http/server";
import { UuidGenerator } from "./infrastructure/crypto/uuid";
import { PasswordHasher } from "./infrastructure/crypto/password-hasher";

class Application {
  private readonly server: Server;

  constructor() {
    const controllers = [
      new AuthController(
        new UserService(
          new UserPostgres(),
          new UuidGenerator(),
          new PasswordHasher()
        )
      ),
    ];
    this.server = new Server(8080, controllers);
  }

  start() {
    this.server.start();
  }
}

new Application().start();
