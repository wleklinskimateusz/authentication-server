import { sql } from "bun";

await sql`
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        hashed_password TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`;

await sql`
    CREATE TABLE IF NOT EXISTS services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        version TEXT NOT NULL DEFAULT '1.0.0',
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`;

await sql`
    CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (service_id, name)
    )
`;

await sql`
    CREATE TABLE IF NOT EXISTS groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`;

await sql`
    CREATE TABLE IF NOT EXISTS user_groups (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, group_id)
    )
`;

await sql`
    CREATE TABLE IF NOT EXISTS group_permissions (
        group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (group_id, permission_id)
    )
`;

process.exit(0);
