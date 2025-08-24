import z from "zod";
import { BasePostgres } from "./base-postgres";

const permissionRowSchema = z.tuple([
    z.string(), // id
    z.string(), // name
    z.string(), // service
    z.string(), // description
    z.date(), // created_at
    z.date(), // updated_at
]);

type PermissionRow = z.infer<typeof permissionRowSchema>;

import type { PermissionRepository } from "../../application/permission.service";
import { Permission } from "../../domain/permission";
import { sql } from "bun";
import type { ServiceRepository } from "../../application/service.service";
import { NotFound } from "../../domain/errors/not-found";
import { ShouldNotHappenError } from "../../domain/errors/should-not-happen-error";

export class PermissionPostgres extends BasePostgres<PermissionRow, Permission>
    implements PermissionRepository {
    private readonly serviceRepository: ServiceRepository;
    rowSchema = permissionRowSchema;

    constructor(serviceRepository: ServiceRepository) {
        super();
        this.serviceRepository = serviceRepository;
    }

    override async toInstance(row: PermissionRow): Promise<Permission> {
        const service = await this.serviceRepository.findById(row[2]);
        if (!service) {
            throw new NotFound(`Service with id ${row[2]} not found`);
        }
        return new Permission({
            id: row[0],
            name: row[1],
            service,
            description: row[3],
            createdAt: row[4],
            updatedAt: row[5],
        });
    }

    private getServiceId(permissions: Permission[]): string {
        const serviceId = permissions[0]?.service.id;
        if (!serviceId) {
            throw new ShouldNotHappenError(
                "Service ID must be provided for upserting permissions",
            );
        }
        return serviceId;
    }

    upsert(permissions: Permission[]): Promise<void> {
        const serviceId = this.getServiceId(permissions);

        return sql`
            INSERT INTO permissions (id, name, service_id, description, created_at, updated_at)
            VALUES 
            ${
            permissions.map(({ id, name, description }) =>
                `(${id}, ${name}, ${serviceId}, ${description}, NOW(), NOW())`
            ).join(",\n")
        }
            ON CONFLICT (id) DO UPDATE
            SET
            name        = EXCLUDED.name,
            description = EXCLUDED.description,
            updated_at  = now()
            WHERE
            permissions.name        IS DISTINCT FROM EXCLUDED.name
            OR permissions.description IS DISTINCT FROM EXCLUDED.description;
        `.execute();
    }

    deleteMissing(
        permissions: Permission[],
    ): Promise<void> {
        const serviceId = this.getServiceId(permissions);
        return sql`DELETE FROM permissions p
        WHERE p.service_id = ${serviceId}
          AND NOT EXISTS (
            SELECT 1 FROM (VALUES
              ${permissions.map(({ name }) => `(${name})`).join(",\n")}
            ) AS v(name)
            WHERE v.name = p.name
          );`.execute();
    }

    async findUserPermissions(
        userId: string,
        serviceId: string,
    ): Promise<Permission[]> {
        const query = sql`
      SELECT p.* FROM permissions p
      JOIN user_groups ug ON ug.group_id = p.service
      JOIN users u ON u.id = ug.user_id
      WHERE u.id = ${userId} AND p.service = ${serviceId}
    `;
        const rows = await query.values();
        if (rows.length === 0) {
            return [];
        }
        return this.parseMultipleResponse(rows);
    }

    async findGroupPermissions(
        groupId: string,
    ): Promise<Permission[]> {
        const query = sql`
      SELECT p.* FROM permissions p
      JOIN group_permissions gp ON gp.permission_id = p.id
      WHERE gp.group_id = ${groupId}
    `;
        const rows = await query.values();
        if (rows.length === 0) {
            return [];
        }
        return this.parseMultipleResponse(rows);
    }
}
