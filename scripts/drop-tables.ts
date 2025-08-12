import { sql } from "bun";

await sql`
    DROP TABLE IF EXISTS users
`;

await sql`
    DROP TABLE IF EXISTS permissions
`;

process.exit(0);
