import { UserService } from "./application/user.service";
import { UserPostgres } from "./infrastructure/user-postgres";
import { AuthController } from "./interfaces/auth.controller";

import { Server } from "./server";

class Application {
  private readonly server: Server;

  constructor() {
    const controllers = [
      new AuthController(new UserService(new UserPostgres())),
    ];
    this.server = new Server(8080, controllers);
  }

  start() {
    this.server.start();
  }
}

new Application().start();
