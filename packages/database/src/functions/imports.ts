import "dotenv/config";
import { and, eq } from "drizzle-orm/pg-core/expressions";
import { db } from "../index";
import { imports } from "../schemas/imports";

/**
 *  Find all imports by the user id
 * @param userId - The ID of the user
 * @returns The import objects
 */
export async function findAllImportsByUserId(userId: string) {
	return db.query.imports.findMany({ where: eq(imports.userId, userId) });
}

/**
 * Find all imports by the user id and is not appealed
 * @param userId - The ID of the user
 * @returns The import objects
 */
export async function findAllImportsByUserIdNotAppealed(userId: string) {
	return db.query.imports.findMany({
		where: and(eq(imports.userId, userId), eq(imports.appealed, false)),
	});
}

/**
 * Find an import by the user and server id
 * @param userId - The ID of the user
 * @param serverId - The ID of the server
 * @returns The import object
 */
export async function findImportByUserAndServerId(
	userId: string,
	serverId: string,
) {
	return db.query.imports.findFirst({
		where: and(eq(imports.userId, userId), eq(imports.serverId, serverId)),
	});
}
