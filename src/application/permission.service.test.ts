import { beforeEach, describe, expect, it } from "bun:test";
import {
    type PermissionRepository,
    PermissionService,
} from "./permission.service";
import { UuidGenerator } from "../infrastructure/crypto/uuid";
import { Service } from "../domain/service";
import { Permission } from "../domain/permission";

class MockPermissionRepository implements PermissionRepository {
    private permissions: Map<string, Permission> = new Map();

    async upsert(permissions: Permission[]): Promise<void> {
        permissions.forEach((permission) => {
            this.permissions.set(permission.id, permission);
        });
    }

    async deleteMissing(permissions: Permission[]): Promise<void> {
        const ids = permissions.map(({ id }) => id);
        this.permissions.forEach(({ id }) => {
            if (!ids.includes(id)) {
                this.permissions.delete(id);
            }
        });
    }

    async findUserPermissions(
        userId: string,
        serviceId: string,
    ): Promise<Permission[]> {
        return Array.from(this.permissions.values()).filter(
            (p) => p.service.id === serviceId,
        );
    }
}

describe("PermissionService", () => {
    let permissionService: PermissionService;
    let mockRepository: MockPermissionRepository;

    beforeEach(() => {
        mockRepository = new MockPermissionRepository();
        permissionService = new PermissionService(
            mockRepository,
        );
    });

    it("should create a permission", async () => {
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
        await permissionService.updatePermissionsForService([
            permission,
        ]);
        const [createdPermission] = await mockRepository.findUserPermissions(
            "user1",
            permission.service.id,
        );

        expect(createdPermission).toEqual(permission);
        expect(createdPermission?.name).toBe("Test Permission");
    });

    it("should check if a user has a permission", async () => {
        const service = new Service({
            id: "service1",
            name: "Test Service",
            description: "Test Service Description",
        });

        const permission = new Permission({
            id: "1",
            name: "Test Permission",
            service,
            description: "This is a test permission",
        });

        await mockRepository.upsert([permission]);

        const hasPermission = await permissionService.hasPermission(
            "user1",
            service.id,
            permission.name,
        );

        expect(hasPermission).toBe(true);
    });

    it("should return false for non-existent permission", async () => {
        const service = new Service({
            id: "service1",
            name: "Test Service",
            description: "Test Service Description",
        });

        const hasPermission = await permissionService.hasPermission(
            "user1",
            service.id,
            "NonExistentPermission",
        );

        expect(hasPermission).toBe(false);
    });
});
