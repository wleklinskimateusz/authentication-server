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

    it("should update attributes", () => {
        const initialTime = Date.UTC(2025, 0, 1, 0, 0, 0, 0);
        setSystemTime(initialTime);
        const service = new Service({
            id: "1",
            name: "Test Service",
            description: "This is a test service",
        });

        const deltaTime = 500;

        setSystemTime(initialTime + deltaTime);

        service.name = "Updated Service";
        service.description = "Updated description";
        service.url = "https://example.com";
        service.icon = "https://example.com/icon.png";
        service.version = "2.0.0";

        expect(service.name).toBe("Updated Service");
        expect(service.description).toBe("Updated description");
        expect(service.url).toBe("https://example.com");
        expect(service.icon).toBe("https://example.com/icon.png");
        expect(service.version).toBe("2.0.0");
        expect(service.updatedAt.getTime()).toEqual(
            service.createdAt.getTime() + deltaTime,
        );
    });
});
