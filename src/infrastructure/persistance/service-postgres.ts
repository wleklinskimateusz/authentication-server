import { sql } from "bun";
import type { ServiceRepository } from "../../application/service.service";
import { Service } from "../../domain/service";
import { BasePostgres } from "./base-postgres";
import z from "zod";

const rowSchema = z.tuple([
    z.string(),
    z.string(),
    z.string(),
    z.string(),
    z.string(),
    z.string(),
    z.date(),
    z.date(),
]);

type ServiceRow = z.infer<typeof rowSchema>;

export class ServicePostgres extends BasePostgres<ServiceRow, Service>
    implements ServiceRepository {
    rowSchema = rowSchema;

    override toInstance(row: ServiceRow) {
        return new Service({
            id: row[0],
            version: row[1],
            name: row[2],
            description: row[3],
            url: row[4],
            icon: row[5],
            createdAt: row[6],
            updatedAt: row[7],
        });
    }

    async create(service: Service): Promise<void> {
        const query = sql`
        INSERT INTO services (id, name, description, url, icon, created_at, updated_at)
        VALUES (${service.id}, ${service.version}, ${service.name}, ${service.description}, ${service.url}, ${service.icon}, ${service.createdAt}, ${service.updatedAt})
        `;
        await query.execute();
    }

    async findById(id: string): Promise<Service | null> {
        return this.parseUniqueResponse(
            await sql`
            SELECT * FROM services WHERE id = ${id}
        `.values(),
        );
    }

    async update(service: Service): Promise<void> {
        const query = sql`
        UPDATE services
        SET name = ${service.name}, description = ${service.description}, url = ${service.url}, icon = ${service.icon}, updated_at = ${service.updatedAt}
        WHERE id = ${service.id}
        `;
        await query.execute();
    }

    async delete(id: string): Promise<void> {
        const query = sql`
        DELETE FROM services WHERE id = ${id}
        `;
        await query.execute();
    }

    async findByName(name: string): Promise<Service | null> {
        return this.parseUniqueResponse(
            await sql`
            SELECT * FROM services WHERE name = ${name}
        `.values(),
        );
    }

    async findAll(): Promise<Service[]> {
        const query = sql`
        SELECT * FROM services
        `;
        return this.parseMultipleResponse(await query.values());
    }
}
