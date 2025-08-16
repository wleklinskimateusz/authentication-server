type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export type ControllerRoute = {
  path: string;
  method: HttpMethod;
  handler: (request: Request) => Promise<Response>;
};

export interface Controller {
  registerRoutes(): { path: string; routes: ControllerRoute[] };
}

export class Server {
  private readonly port: number;
  private readonly controllers: Controller[];

  constructor(port: number, controllers: Controller[]) {
    this.port = port;
    this.controllers = controllers;
  }

  findController(path: string) {
    return this.controllers.find((c) => {
      const { path: controllerPath } = c.registerRoutes();
      return path.startsWith(controllerPath);
    });
  }

  findRoute(controller: Controller, path: string, method: string) {
    const { path: controllerPath, routes } = controller.registerRoutes();
    return routes.find((r) => {
      const fullPath = controllerPath + r.path;
      return fullPath === path && r.method === method;
    });
  }

  start() {
    console.log(`Server is running on port ${this.port}`);
    Bun.serve({
      port: this.port,
      fetch: async (request) => {
        const path = new URL(request.url).pathname;
        const method = request.method;

        const controller = this.findController(path);
        if (controller) {
          const route = this.findRoute(controller, path, method);
          if (route) {
            return route.handler(request);
          }
        }

        return new Response("Not found", { status: 404 });
      },
    });
  }
}
