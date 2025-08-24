import z from "zod";
import { BasePostgres } from "./base-postgres";
import { PermissionGroup } from "../../domain/permission-group";
import type { PermissionGroupRepository } from "../../application/permission-group.service";
import { sql } from "bun";
import type { PermissionRepository } from "../../application/permission.service";

const permissionGroupRowSchema = z.tuple([
    z.string(), // id
    z.string(), // name
    z.string(), // description
    z.date(), // created_at
    z.date(), // updated_at
]);

export class PermissionGroupPostgres implements PermissionGroupRepository {
    permissionRepository: PermissionRepository;
    rowSchema = permissionGroupRowSchema;

    constructor(permissionRepository: PermissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    private async parseRow(row: unknown[]): Promise<PermissionGroup> {
        const parsedRow = this.rowSchema.parse(row);
        return new PermissionGroup({
            id: parsedRow[0],
            name: parsedRow[1],
            description: parsedRow[2],
            permissions: await this.permissionRepository.findGroupPermissions(
                parsedRow[0],
            ),
            createdAt: parsedRow[3],
            updatedAt: parsedRow[4],
        });
    }

    async createGroup(group: PermissionGroup): Promise<void> {
        await sql`
      INSERT INTO groups ${
            sql({
                id: group.id,
                name: group.name,
                description: group.description,
                created_at: group.createdAt,
                updated_at: group.updatedAt,
            })
        }`;
    }

    async findGroupById(id: string): Promise<PermissionGroup | null> {
        const result = await sql`
      SELECT id, name, description, created_at, updated_at 
      FROM groups 
      WHERE id = ${id}
    `;

        return this.parseRow(result[0]);
    }

    async deleteGroup(id: string): Promise<void> {
        await sql`
      DELETE FROM groups 
      WHERE id = ${id}
    `;
    }

    async updateGroup(
        { name, id, description }: PermissionGroup,
    ): Promise<void> {
        await sql`
      UPDATE groups 
      SET ${sql({ name, description })}
      WHERE id = ${id}
    `;
    }

    async addPermissionsToGroup(
        groupId: string,
        permissionIds: string[],
    ): Promise<void> {
        if (permissionIds.length === 0) return;

        await sql`
      INSERT INTO group_permissions ${
            sql(permissionIds
                .map(
                    (permissionId) => ({
                        group_id: groupId,
                        permission_id: permissionId,
                    }),
                ))
        } ON CONFLICT DO NOTHING
    `;
    }

    async removePermissionsFromGroup(
        groupId: string,
        permissionIds: string[],
    ): Promise<void> {
        if (permissionIds.length === 0) return;

        await sql`
      DELETE FROM group_permissions 
      WHERE group_id = ${groupId} 
      AND permission_id IN (${sql(permissionIds)})
    `;
    }

    async findGroupsByName(name: string): Promise<PermissionGroup[]> {
        const result = await sql<unknown[][]>`
      SELECT id, name, description, created_at, updated_at 
      FROM groups 
      WHERE name = ${name}
    `;

        return Promise.all(result.map((row) => this.parseRow(row)));
    }

    async findUserGroups(userId: string): Promise<PermissionGroup[]> {
        const result = await sql<unknown[][]>`
      SELECT id, name, description, created_at, updated_at 
      FROM groups g
      JOIN user_groups ug ON ug.group_id = g.id
      WHERE ug.user_id = ${userId}
    `;

        return Promise.all(result.map((row) => this.parseRow(row)));
    }

    async searchGroups(
        filters: Partial<Record<"name", string>>,
        userId: string,
    ): Promise<PermissionGroup[]> {
        const fields = Object.entries(filters).filter(([, v]) =>
            v !== undefined
        );
        const andClause = fields.length
            ? sql`AND ${
                sql(
                    fields
                        .map(([key, value]) =>
                            sql`pg.${sql(key)} ILIKE ${`%${value}%`}`
                        )
                        .reduce((prev, curr) => sql`${prev} AND ${curr}`),
                )
            }`
            : sql``;

        const query = sql<unknown[][]>`
      SELECT DISTINCT id, name, description, created_at, updated_at
      FROM group g
      JOIN user_groups ug ON ug.group_id = g.id
      WHERE ug.user_id = ${userId}
      ${andClause}
    `;
        const result = await query;

        return Promise.all(result.map((row) => this.parseRow(row)));
    }
}
