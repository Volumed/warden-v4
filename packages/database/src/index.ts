import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";

import { badServers } from "./schemas/bad-servers";
import { guilds } from "./schemas/guilds";
import { imports } from "./schemas/imports";
import { notes } from "./schemas/notes";
import { punishments } from "./schemas/punishments";
import { rolesArchive } from "./schemas/roles";
import { users } from "./schemas/users";

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not defined in the environment variables.");
}

const schema = {
	users: users,
	notes: notes,
	badServers: badServers,
	imports: imports,
	guilds: guilds,
	punishments: punishments,
	rolesArchive: rolesArchive,
};

const db = drizzle(process.env.DATABASE_URL, {
	schema,
});

export { db };
