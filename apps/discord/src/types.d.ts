declare module "database/dist/index.js" {
	export function findUserById(id: string): Promise<{ id: string }>;
	export function findAllImportsByUserId(id: string): Promise<{ id: string }>;
	export function findAllImportsByUserIdNotAppealed(
		id: string,
	): Promise<{ id: string }>;
}
