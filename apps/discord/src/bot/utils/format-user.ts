type ImportItem = {
	type: "OTHER" | "LEAKER" | "CHEATER" | "SUPPORTER" | "OWNER" | "BOT";
	createdBy: string | null;
	updatedBy: string | null;
	createdAt: Date | null;
	updatedAt: Date | null;
	userId: string;
	serverId: string;
	roles: string[];
	appealed: boolean | null;
};

type TransformedImportItem = Omit<ImportItem, "type"> & {
	type: "Other" | "Leaker" | "Cheater" | "Supporter" | "Owner";
};

export const formatUserTypes = (imports: ImportItem[]) => {
	const typeOrder = ["Other", "Leaker", "Cheater", "Supporter", "Owner"];

	return Array.from(
		new Set(
			imports.map(
				(item: ImportItem) =>
					(item.type.charAt(0).toUpperCase() +
						item.type.slice(1).toLowerCase()) as TransformedImportItem["type"],
			),
		),
	).sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b));
};

export const formatUserType = (value: string) => {
	const typeMap: Record<string, string> = {
		OTHER: "Other",
		LEAKER: "Leaker",
		CHEATER: "Cheater",
		SUPPORTER: "Supporter",
		OWNER: "Owner",
	};

	return typeMap[value] || value.charAt(0).toUpperCase() + value.slice(1);
};
