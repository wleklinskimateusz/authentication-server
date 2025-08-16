import z from "zod";
import type {
  Controller,
  ControllerRoute,
} from "../infrastructure/http/server";
import { BaseController } from "./base-controller";
import type { UserService } from "../application/user.service";

export class AuthController extends BaseController implements Controller {
  constructor(userService: UserService) {
    super(userService);
  }

  async login(req: Request) {
    try {
      const { username, password } = await this.validateRequestBody(
        req,
        z.object({
          username: z.string(),
          password: z.string(),
        }),
      );
      const token = await this.userService.login(username, password);
      return Response.json(token, { status: 200 });
    } catch (error) {
      return this.handleError(error);
    }
  }

  async register(req: Request) {
    try {
      const { username, password } = await this.validateRequestBody(
        req,
        z.object({
          username: z.string(),
          password: z.string(),
        }),
      );
      await this.userService.register(username, password);
      return Response.json({ message: "User registered" }, { status: 201 });
    } catch (error) {
      return this.handleError(error);
    }
  }

  registerRoutes() {
    const routes = [
      {
        path: "/login",
        method: "POST",
        handler: this.login.bind(this),
      },
      {
        path: "/register",
        method: "POST",
        handler: this.register.bind(this),
      },
    ] satisfies ControllerRoute[];

    return { path: "/auth", routes };
  }
}
