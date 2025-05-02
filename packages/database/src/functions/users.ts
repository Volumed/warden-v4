import "dotenv/config";
import { eq } from "drizzle-orm/pg-core/expressions";
import { db } from "../index";
import { users } from "../schemas/users";

/**
 * Find a user by their ID
 * @param id - The ID of the user to find
 * @returns The user object
 */
export async function findUserById(id: string) {
	return db.query.users.findFirst({
		where: eq(users.id, id),
	});
}
