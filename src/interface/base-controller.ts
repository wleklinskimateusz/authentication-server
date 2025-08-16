import type z from "zod";
import type { UserService } from "../application/user.service";
import { BaseError } from "../domain/errors/base-error";

export class InvalidRequestBodyError extends BaseError {
    constructor(message: string) {
        super(message, 400);
        this.name = "InvalidRequestBodyError";
    }
}

export abstract class BaseController {
    protected readonly userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    protected async validateRequestBody<T>(
        req: Request,
        schema: z.ZodSchema<T>,
    ) {
        try {
            const body = await req.json();
            const { success, data, error } = schema.safeParse(body);
            if (!success) {
                throw new InvalidRequestBodyError(
                    `Invalid request body: ${JSON.stringify(error.message)}`,
                );
            }
            return data;
        } catch (error) {
            if (error instanceof InvalidRequestBodyError) {
                throw error;
            }
            if (error instanceof Error) {
                throw new InvalidRequestBodyError(
                    `Invalid request body: ${JSON.stringify(error.message)}`,
                );
            }
            throw new InvalidRequestBodyError(
                `Invalid request body: ${JSON.stringify(error)}`,
            );
        }
    }
}
