import z from "zod";
import type { PermissionGroupService } from "../application/permission-group.service";
import { UserService } from "../application/user.service";
import type {
    Controller,
    ControllerRoute,
} from "../infrastructure/http/server";
import { BaseController, InvalidRequestBodyError } from "./base-controller";
import { NotFound } from "../domain/errors/not-found";

export class GroupController extends BaseController implements Controller {
    permissionGroupService: PermissionGroupService;
    constructor(
        permissionGroupService: PermissionGroupService,
        userService: UserService,
    ) {
        super(userService);
        this.permissionGroupService = permissionGroupService;
    }

    async createGroup(req: Request) {
        const { name, description } = await this.validateRequestBody(
            req,
            z.object({
                name: z.string().min(3).max(50),
                description: z.string().max(255),
            }),
        );

        await this.permissionGroupService.createGroup(
            name,
            description,
            req.auth!.userId,
        );

        return Response.json({ message: "Group created" }, { status: 201 });
    }

    async searchUserGroups(req: Request) {
        const params = Object.fromEntries(new URL(req.url).searchParams);
        if ("name" in params && typeof params.name !== "string") {
            throw new InvalidRequestBodyError("Invalid name parameter");
        }
        if ("name" in params) {
            const groups = await this.permissionGroupService.searchGroups(
                { name: params.name },
                req.auth!.userId,
            );
            return Response.json(groups, { status: 200 });
        }
        const groups = await this.permissionGroupService.getUserGroups(
            req.auth!.userId,
        );

        return Response.json(groups, { status: 200 });
    }

    async updateGroup(req: Request) {
        const { id, name, description } = await this.validateRequestBody(
            req,
            z.object({
                id: z.string(),
                name: z.string().min(3).max(50).optional(),
                description: z.string().max(255).optional(),
            }),
        );

        await this.permissionGroupService.updateGroup(id, {
            name,
            description,
        });

        return Response.json({ message: "Group updated" }, { status: 200 });
    }

    async deleteGroup(req: Request) {
        const { id } = Object.fromEntries(new URL(req.url).searchParams);
        if (typeof id !== "string") {
            throw new InvalidRequestBodyError("Missing group id");
        }

        try {
            await this.permissionGroupService.deleteGroup(id);
        } catch (error) {
            if (error instanceof NotFound) {
                return Response.json(
                    { message: `Group with id ${id} was already deleted` },
                    { status: 204 },
                );
            }
        }

        return Response.json({ message: `Group with id ${id} deleted` }, {
            status: 200,
        });
    }

    async findGroupById(req: Request) {
        const { id } = Object.fromEntries(new URL(req.url).searchParams);
        if (typeof id !== "string") {
            throw new InvalidRequestBodyError("Missing group id");
        }
        const group = await this.permissionGroupService.getGroupById(id);
        return Response.json(group, { status: 200 });
    }

    registerRoutes(): { path: string; routes: ControllerRoute[] } {
        const routes = [
            {
                path: "/",
                method: "POST",
                handler: this.createGroup.bind(this),
            },
            {
                path: "/",
                method: "GET",
                handler: this.searchUserGroups.bind(this),
            },
            {
                path: "/[id]",
                method: "GET",
                handler: this.findGroupById.bind(this),
            },
            {
                path: "/[id]",
                method: "PUT",
                handler: this.updateGroup.bind(this),
            },
            {
                path: "/[id]",
                method: "DELETE",
                handler: this.deleteGroup.bind(this),
            },
        ] satisfies ControllerRoute[];

        return { path: "/groups", routes };
    }
}
