import { describe, expect, it, setSystemTime } from "bun:test";
import { Permission } from "./permission";
import { Service } from "./service";

describe("Permission", () => {
    it("should create a permission with valid properties", () => {
        const permission = new Permission({
            id: "1",
            name: "Test Permission",
            service: new Service({
                id: "service1",
                name: "Test Service",
                description: "Test Service Description",
            }),
            description: "This is a test permission",
        });

        expect(permission.id).toBe("1");
        expect(permission.name).toBe("Test Permission");
        expect(permission.service.id).toBe("service1");
        expect(permission.description).toBe("This is a test permission");
        expect(permission.createdAt).toBeInstanceOf(Date);
        expect(permission.updatedAt).toBeInstanceOf(Date);
    });
});
