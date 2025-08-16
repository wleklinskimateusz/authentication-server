import { Service } from "./service";
import { afterEach, describe, expect, it, setSystemTime } from "bun:test";

describe("Service", () => {
    afterEach(() => {
        setSystemTime();
    });

    it("should create a service with valid properties", () => {
        const service = new Service({
            id: "1",
            name: "Test Service",
            description: "This is a test service",
        });

        expect(service.id).toBe("1");
        expect(service.name).toBe("Test Service");
        expect(service.description).toBe("This is a test service");
        expect(service.createdAt).toBeInstanceOf(Date);
        expect(service.updatedAt).toBeInstanceOf(Date);
    });
});
