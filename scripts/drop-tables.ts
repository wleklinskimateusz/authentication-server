import { sql } from "bun";

await sql`
    DROP TABLE IF EXISTS users
`;

process.exit(0);
