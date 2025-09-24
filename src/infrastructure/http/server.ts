import { BaseError } from "../../domain/errors/base-error";
import { NotFound } from "../../domain/errors/not-found";

declare global {
  interface Request {
    params?: Map<string, string>;
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type Middleware = (request: Request) => Promise<void>;

export type ControllerRoute = {
  path: string;
  method: HttpMethod;
  handler: (request: Request) => Promise<Response>;
  public?: boolean;
  middleware?: Middleware;
};
export interface Controller {
  registerRoutes: () => { path: string; routes: ControllerRoute[] };
  middleware?: Middleware;
}

export class Server {
  private readonly port: number;
  private readonly controllers: Controller[];
  private readonly authMiddleware: Middleware;

  constructor(
    port: number,
    controllers: Controller[],
    authMiddleware: Middleware,
  ) {
    this.port = port;
    this.controllers = controllers;
    this.authMiddleware = authMiddleware;
  }

  findController(path: string) {
    const controller = this.controllers.find((c) => {
      const { path: controllerPath } = c.registerRoutes();
      return path.startsWith(controllerPath);
    });
    if (!controller) {
      throw new NotFound(
        `No route found for path: ${path.split("/")[0]}/`,
      );
    }
    return controller;
  }

  removeFirstAndLastSlash(str: string) {
    if (str.startsWith("/")) {
      str = str.slice(1);
    }
    if (str.endsWith("/")) {
      str = str.slice(0, -1);
    }
    return str;
  }

  findRoute(
    controller: Controller,
    path: string,
    method: string,
    request: Request,
  ) {
    const { path: controllerPath, routes } = controller.registerRoutes();
    const trimmedPath = this.removeFirstAndLastSlash(path);
    const potentialRoutes = routes.filter((r) => {
      let fullPath = this.removeFirstAndLastSlash(controllerPath + r.path);
      if (r.path.includes("[")) {
        console.log({
          controllerPath,
          routePath: r.path,
          fullPath: controllerPath + r.path,
          requestPath: path,
        });

        const routeParts = fullPath.split("/");
        const pathParts = trimmedPath.split("/");

        if (routeParts.length !== pathParts.length) {
          return false;
        }
        const params = new Map<string, string>();

        for (let i = 0; i < routeParts.length; i++) {
          const pathPart = pathParts[i];
          if (!pathPart) {
            return false;
          }
          if (
            !(routeParts[i]?.startsWith("[") && routeParts[i]?.endsWith("]"))
          ) {
            continue;
          }
          console.log({ routePart: routeParts[i], pathPart });

          const paramName = routeParts[i]?.slice(1, -1);
          console.log({ paramName });
          if (!paramName) {
            return false;
          }
          params.set(paramName, pathPart);
        }

        request.params = params;
      }

      // if request.params is defined, replace params in fullPath with values from request.params
      if (request.params) {
        for (const [key, value] of request.params) {
          fullPath = fullPath.replace(`[${key}]`, value);
          console.log({ fullPath });
        }
      }

      return fullPath === trimmedPath;
    });

    if (!potentialRoutes.length) {
      throw new NotFound(`No route found for ${method} ${path}`);
    }

    const route = potentialRoutes.find((r) => r.method === method);

    if (!route) {
      throw new MethodNotAllowedError(
        `Method ${method} not allowed for route ${path}`,
      );
    }

    return route;
  }

  handleError(error: unknown) {
    console.error({ error });
    if (error instanceof BaseError) {
      return Response.json(
        { error: error.message, cause: error.cause || null },
        { status: error.statusCode },
      );
    }
    return Response.json(
      {
        error: "Internal server error",
        cause: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }

  start() {
    console.log(`Server is running on port ${this.port}`);
    Bun.serve({
      port: this.port,
      fetch: async (request) => {
        try {
          const path = new URL(request.url).pathname;
          const method = request.method;

          const controller = this.findController(path);

          if (controller.middleware) {
            await controller.middleware(request);
          }

          const route = this.findRoute(controller, path, method, request);

          if (!route.public) {
            await this.authMiddleware(request);
          }

          if (route.middleware) {
            await route.middleware(request);
          }

          console.log(`${method} ${path}`);
          return await route.handler(request);
        } catch (error) {
          return this.handleError(error);
        }
      },
    });
  }
}

export class MethodNotAllowedError extends BaseError {
  constructor(message: string) {
    super(message, 405);
    this.name = "MethodNotAllowedError";
  }
}
