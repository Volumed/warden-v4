declare module "database/dist/index.js" {
	export function findUserById(id: string): Promise<{ id: string }>;
	export function findAllImportsByUserId(id: string): Promise<{ id: string }>;
	export function findAllImportsByUserIdNotAppealed(
		id: string,
	): Promise<{ id: string }>;
	export function countNotesByUserId(id: string): Promise<{ id: string }>;
	export function checkDbConnection(): Promise<{
		connected: boolean;
		latency: number | null;
	}>;
}
