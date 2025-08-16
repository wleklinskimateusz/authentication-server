import { BaseError } from "./base-error";

export class ShouldNotHappenError extends BaseError {
    constructor(message: string) {
        super(message, 500);
        this.name = "ShouldNotHappenError";
    }
}
