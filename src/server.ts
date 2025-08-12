interface Route {
  path: string;
  method: string;
  handler: (request: Request) => Promise<Response>;
}

export interface Controller {
  registerRoutes(): { path: string; routes: Route[] };
}

export class Server {
  private readonly port: number;
  private readonly controllers: Controller[];

  constructor(port: number, controllers: Controller[]) {
    this.port = port;
    this.controllers = controllers;
  }

  start() {
    console.log(`Server is running on port ${this.port}`);
    Bun.serve({
      port: this.port,
      fetch: async (request) => {
        const path = new URL(request.url).pathname;
        const method = request.method;

        // find correct controller by looking at first part of path
        const controller = this.controllers.find((c) => {
          const { path: controllerPath } = c.registerRoutes();
          return path.startsWith(controllerPath);
        });

        if (controller) {
          const { path: controllerPath, routes } = controller.registerRoutes();
          const route = routes.find((r) => {
            const fullPath = controllerPath + r.path;
            return fullPath === path && r.method === method;
          });
          if (route) {
            return route.handler(request);
          }
        }

        return new Response("Not found", { status: 404 });
      },
    });
  }
}
