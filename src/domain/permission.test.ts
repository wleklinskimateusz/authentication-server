import { describe, expect, it, setSystemTime } from "bun:test";
import { Permission } from "./permission";

describe("Permission", () => {
    it("should create a permission with valid properties", () => {
        const permission = new Permission({
            id: "1",
            name: "Test Permission",
            service: {
                id: "service1",
                name: "Test Service",
                description: "Test Service Description",
            },
            description: "This is a test permission",
        });

        expect(permission.id).toBe("1");
        expect(permission.name).toBe("Test Permission");
        expect(permission.service.id).toBe("service1");
        expect(permission.description).toBe("This is a test permission");
        expect(permission.createdAt).toBeInstanceOf(Date);
        expect(permission.updatedAt).toBeInstanceOf(Date);
    });

    it("should update name and description", () => {
        setSystemTime(new Date(Date.UTC(2025, 0, 1, 0, 0, 0, 0)));
        const permission = new Permission({
            id: "1",
            name: "Test Permission",
            service: {
                id: "service1",
                name: "Test Service",
                description: "Test Service Description",
            },
            description: "This is a test permission",
        });

        setSystemTime(new Date(Date.UTC(2025, 0, 1, 0, 0, 0, 500)));

        permission.name = "Updated Permission";
        permission.description = "Updated description";

        expect(permission.name).toBe("Updated Permission");
        expect(permission.description).toBe("Updated description");
        expect(permission.updatedAt.getTime()).toEqual(
            permission.createdAt.getTime() + 500,
        );
    });
});
