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

    async create(permission: Permission): Promise<void> {
        this.permissions.set(permission.id, permission);
    }

    async findById(id: string): Promise<Permission | null> {
        return this.permissions.get(id) || null;
    }

    async update(permission: Permission): Promise<void> {
        this.permissions.set(permission.id, permission);
    }

    async delete(id: string): Promise<void> {
        this.permissions.delete(id);
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
            new UuidGenerator(),
        );
    });

    it("should create a permission", async () => {
        const permission = await permissionService.createPermission({
            name: "Test Permission",
            service: new Service({
                id: "service1",
                name: "Test Service",
                description: "Test Service Description",
            }),
            description: "This is a test permission",
        });
        const createdPermission = await mockRepository.findById(permission.id);

        expect(createdPermission).toEqual(permission);
        expect(createdPermission?.name).toBe("Test Permission");
    });

    it("should update a permission", async () => {
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

        await mockRepository.create(permission);

        const updatedPermission = { ...permission, name: "Updated Permission" };
        await permissionService.updatePermission("1", {
            name: updatedPermission.name,
        });

        const foundPermission = await mockRepository.findById("1");
        expect(foundPermission?.name).toBe(updatedPermission.name);
    });

    it("should delete a permission", async () => {
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

        await mockRepository.create(permission);
        await permissionService.deletePermission("1");

        const foundPermission = await mockRepository.findById("1");
        expect(foundPermission).toBeNull();
    });

    it("should get a permission by ID", async () => {
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

        await mockRepository.create(permission);
        const foundPermission = await permissionService.getPermissionById("1");

        expect(foundPermission).toEqual(permission);
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

        await mockRepository.create(permission);

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

    it("should throw PermissionNotFound when updating non-existent permission", async () => {
        expect(
            permissionService.updatePermission("non-existent-id", {
                name: "Updated Permission",
            }),
        ).rejects.toThrow("cannot update permission with id non-existent-id");
    });
});
