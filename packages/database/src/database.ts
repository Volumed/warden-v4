import "dotenv/config";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { badServers } from "./schemas/bad-servers";
import { guilds } from "./schemas/guilds";
import { imports, importsRelations } from "./schemas/imports";
import { notes } from "./schemas/notes";
import { punishments } from "./schemas/punishments";
import { rolesArchive } from "./schemas/roles";
import { users } from "./schemas/users";

const getEnvVariable = (name: string) => {
	const value = process.env[name];
	if (value == null) throw new Error(`environment variable ${name} not found`);
	return value;
};

export const dbSchema = {
	users: users,
	notes: notes,
	badServers: badServers,
	imports: imports,
	importsRelations: importsRelations,
	guilds: guilds,
	punishments: punishments,
	rolesArchive: rolesArchive,
};

export const db: NodePgDatabase<typeof dbSchema> = drizzle<typeof dbSchema>({
	connection: {
		connectionString: getEnvVariable("DATABASE_URL"),
	},
	schema: dbSchema,
});

export const checkDbConnection = async (): Promise<{
	connected: boolean;
	latency: number | null;
}> => {
	try {
		const start = Date.now();
		// Perform a simple query to check the connection
		await db.execute("SELECT 1");
		const latency = Date.now() - start;
		return { connected: true, latency };
	} catch (error) {
		console.error("Database connection check failed:", error);
		return { connected: false, latency: null };
	}
};
