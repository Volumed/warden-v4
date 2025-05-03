import {
	findAllImportsByUserId,
	findAllImportsByUserIdNotAppealed,
} from "database/dist/index.js";
import { findUserById } from "database/dist/index.js";

export interface User {
	id: string;
	status: string;
}

export interface ImportItem {
	type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT";
	createdBy: string;
	updatedBy: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	serverId: string;
	roles: string[];
	appealed: boolean;
}

export interface UserData {
	user?: User;
	imports?: ImportItem[];
}

export const getUser = async (
	userId: string,
	appealed: boolean,
): Promise<UserData> => {
	let data: UserData = {};
	const user = await findUserById(userId);
	if (!user) {
		return data;
	}

	let imports: ImportItem[] = [];
	if (appealed) {
		const result = await findAllImportsByUserId(userId);
		imports = Array.isArray(result) ? (result as ImportItem[]) : [];
	} else {
		const result = await findAllImportsByUserIdNotAppealed(userId);
		imports = Array.isArray(result) ? (result as ImportItem[]) : [];
	}
	if (!Array.isArray(imports) || imports.length === 0) {
		data = { user: user as User };
		return data;
	}

	data = { user: user as User, imports };
	return data;
};
