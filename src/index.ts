import { UserService } from "./application/user.service";
import { UserPostgres } from "./infrastructure/persistance/user-postgres";
import { AuthController } from "./interface/auth.controller";

import { Server } from "./infrastructure/http/server";
import { UuidGenerator } from "./infrastructure/crypto/uuid";
import { PasswordHasher } from "./infrastructure/crypto/password-hasher";
import { UserMiddleware } from "./interface/user.middleware";
import { JWTService } from "./application/jwt.service";
import { GroupController } from "./interface/group.controller";
import { PermissionGroupService } from "./application/permission-group.service";
import { PermissionGroupPostgres } from "./infrastructure/persistance/permission-groups-postgres";
import { PermissionPostgres } from "./infrastructure/persistance/permission-postgres";
import { ServicePostgres } from "./infrastructure/persistance/service-postgres";

class Application {
  private readonly server: Server;

  constructor() {
    const uuidGenerator = new UuidGenerator();
    const passwordHasher = new PasswordHasher();
    const authMiddleWare = new UserMiddleware(new JWTService());

    const controllers = [
      new AuthController(
        new UserService(
          new UserPostgres(),
          uuidGenerator,
          passwordHasher,
        ),
      ),
      new GroupController(
        new PermissionGroupService(
          new PermissionGroupPostgres(
            new PermissionPostgres(new ServicePostgres()),
          ),
          uuidGenerator,
        ),
        new UserService(
          new UserPostgres(),
          uuidGenerator,
          passwordHasher,
        ),
      ),
    ];
    this.server = new Server(
      Number(process.env.PORT) || 8080,
      controllers,
      authMiddleWare.attachUserToRequest.bind(authMiddleWare),
    );
  }

  start() {
    this.server.start();
  }
}

new Application().start();
