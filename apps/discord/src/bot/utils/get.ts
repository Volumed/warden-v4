import {
	findAllImportsByMultiUserId,
	findAllImportsByUserId,
	findAllImportsByUserIdNotAppealed,
} from "@warden/database";
import { findUserById, findUserByIds } from "@warden/database";

export interface User {
	id: string;
	status: string;
	type: string;
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

export const getUsers = async (userIds: string[]): Promise<UserData[]> => {
	const data: UserData[] = [];
	const users = await findUserByIds(userIds);
	if (!Array.isArray(users) || users.length === 0) {
		return data;
	}

	const imports = await findAllImportsByMultiUserId(userIds);

	const importsByUserId = imports.reduce(
		(acc, item) => {
			if (item.userId) {
				if (!acc[item.userId]) {
					acc[item.userId] = [];
				}
				acc[item.userId].push(item as ImportItem);
			}
			return acc;
		},
		{} as Record<string, ImportItem[]>,
	);

	for (const user of users) {
		data.push({
			user: user as User,
			imports: importsByUserId[user.id] || [],
		});
	}

	return data;
};
