import { UserService } from "./application/user.service";
import { UserPostgres } from "./infrastructure/persistance/user-postgres";
import { AuthController } from "./interface/auth.controller";

import { Server } from "./infrastructure/http/server";
import { UuidGenerator } from "./infrastructure/crypto/uuid";
import { PasswordHasher } from "./infrastructure/crypto/password-hasher";

class Application {
  private readonly server: Server;

  constructor() {
    const uuidGenerator = new UuidGenerator();
    const passwordHasher = new PasswordHasher();

    const controllers = [
      new AuthController(
        new UserService(
          new UserPostgres(),
          uuidGenerator,
          passwordHasher,
        ),
      ),
    ];
    this.server = new Server(Number(process.env.PORT) || 8080, controllers);
  }

  start() {
    this.server.start();
  }
}

new Application().start();
