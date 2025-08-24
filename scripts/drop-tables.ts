import { sql } from "bun";

const tables = [
    "group_permissions",
    "user_groups",
    "permissions",
    "groups",
    "services",
    "users",
];

for (const table of tables) {
    await (
        sql`DROP TABLE IF EXISTS ${sql(table)} CASCADE;`.execute()
    );
}

process.exit(0);
