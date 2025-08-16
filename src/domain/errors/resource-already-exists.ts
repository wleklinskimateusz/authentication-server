import { BaseError } from "./base-error";

export class ResourceAlreadyExists extends BaseError {
    constructor(message: string) {
        super(message, 409);
        this.name = "ResourceAlreadyExists";
    }
}
