import z from "zod";
import { UserService } from "../application/user.service";
import { BaseError } from "../common/error";

export class InvalidRequestBodyError extends BaseError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UserController {
  private readonly userService: UserService;
  constructor(userService: UserService) {
    this.userService = userService;
  }

  private async validateRequestBody<T>(req: Request, schema: z.ZodSchema<T>) {
    try {
      const body = await req.json();
      const { success, data, error } = schema.safeParse(body);
      if (!success) {
        throw new InvalidRequestBodyError(
          `Invalid request body: ${JSON.stringify(error)}`
        );
      }
      return data;
    } catch (error) {
      throw new InvalidRequestBodyError(
        `Invalid request body: ${JSON.stringify(error)}`
      );
    }
  }

  private handleError(error: unknown) {
    if (error instanceof BaseError) {
      return Response.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return Response.json(
      {
        error: "Internal server error",
        cause: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }

  async login(req: Request) {
    try {
      const { username, password } = await this.validateRequestBody(
        req,
        z.object({
          username: z.string(),
          password: z.string(),
        })
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
        })
      );
      await this.userService.register(username, password);
      return Response.json({ message: "User registered" }, { status: 201 });
    } catch (error) {
      return this.handleError(error);
    }
  }
}
