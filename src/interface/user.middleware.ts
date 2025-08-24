import type { JWTService } from "../application/jwt.service";
import type { UserService } from "../application/user.service";
import { BaseError } from "../domain/errors/base-error";

declare global {
    interface Request {
        auth?: { userId: string };
    }
}

export class UnauthorizedError extends BaseError {
    constructor(message: string) {
        super(message, 401);
        this.name = "UnauthorizedError";
    }
}

export class UserMiddleware {
    jwtService: JWTService;
    constructor(jwtService: JWTService) {
        this.jwtService = jwtService;
    }

    async attachUserToRequest(
        req: Request,
    ) {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            throw new UnauthorizedError("Missing Authorization header");
        }

        const token = authHeader.replace("Bearer ", "");
        const payload = await this.jwtService.verifyAccessToken(token);
        req.auth = { userId: payload.sub };
    }
}
