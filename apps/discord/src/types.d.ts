declare module "database/dist/functions/users.js" {
	export function findUserById(id: string): Promise<{ id: string }>;
}

declare module "database/dist/functions/imports.js" {
	export function findAllImportsByUserId(id: string): Promise<{ id: string }>;
	export function findAllImportsByUserIdNotAppealed(
		id: string,
	): Promise<{ id: string }>;
}
