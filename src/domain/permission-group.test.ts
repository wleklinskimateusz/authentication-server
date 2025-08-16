import { afterEach, describe, expect, it, setSystemTime } from "bun:test";
import {
    PermissionAlreadyAssigned,
    PermissionGroup,
    PermissionNotFoundInGroup,
} from "./permission-group";
import { Permission } from "./permission";
import { Service } from "./service";

describe("PermissionGroup", () => {
    afterEach(() => {
        setSystemTime();
    });

    it("should create PermissionGroup", () => {
        const systemTime = Date.UTC(2025, 7, 5);
        setSystemTime(systemTime);
        const pg = new PermissionGroup({
            id: "1",
            name: "hello",
            description: "short test",
            permissions: [],
        });

        expect(pg.createdAt.getTime()).toBeCloseTo(systemTime);
        expect(pg.updatedAt.getTime()).toBeCloseTo(systemTime);
        expect(pg.permissions).toEqual([]);
    });

    it("should add permission to a group", () => {
        const pg = new PermissionGroup({
            id: "1",
            name: "hello",
            description: "short test",
            permissions: [],
        });

        const permission = new Permission({
            id: "1",
            name: "new permsiion",
            description: "test description",
            service: new Service({
                id: "test",
                name: "service",
                description: "test description",
            }),
        });

        pg.addPermission(permission);

        expect(pg.hasPermission(permission)).toBe(true);
        expect(pg.permissions).toContain(permission);
        expect(pg.permissions.length).toBe(1);
    });

    it("should remove permission from a group", () => {
        const permissionName = "new permission";
        const pg = new PermissionGroup({
            id: "1",
            name: "hello",
            description: "short test",
            permissions: [
                new Permission({
                    id: "1",
                    name: permissionName,
                    description: "test description",
                    service: new Service({
                        id: "test",
                        name: "service",
                        description: "test description",
                    }),
                }),
            ],
        });

        expect(
            pg.hasPermission({ permissionName, serviceName: "service" }),
        );
        pg.removePermission({ permissionName, serviceName: "service" });
        expect(pg.hasPermission({ permissionName, serviceName: "service" }))
            .toBe(
                false,
            );
    });

    it("should not add the same permission twice", () => {
        const pg = new PermissionGroup({
            id: "1",
            name: "hello",
            description: "short test",
            permissions: [],
        });

        const permission = new Permission({
            id: "1",
            name: "new permission",
            description: "test description",
            service: new Service({
                id: "test",
                name: "service",
                description: "test description",
            }),
        });

        pg.addPermission(permission);
        expect(() => pg.addPermission(permission)).toThrow(
            PermissionAlreadyAssigned,
        );
    });

    it("should not remove non-existing permission", () => {
        const pg = new PermissionGroup({
            id: "1",
            name: "hello",
            description: "short test",
            permissions: [],
        });

        expect(() =>
            pg.removePermission({
                permissionName: "non-existing",
                serviceName: "service",
            })
        ).toThrow(PermissionNotFoundInGroup);
    });
});
