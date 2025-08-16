import { BaseError } from "./base-error";

export class NotFound extends BaseError {
    constructor(message: string) {
        super(message, 404);
        this.name = "NotFound";
    }
}
