import type { User } from "@discordeno/bot";
import type { Interaction } from "@discordeno/bot";
import { MessageComponentTypes } from "@discordeno/bot";
import { bot } from "../../bot.js";
import createCommand from "../../commands.js";
import { deleteValue, getValue, setValue } from "../../redis/redis-client.js";
import embedBuilder from "../../utils/embed.js";
import { formatStatus } from "../../utils/format-status.js";
import { formatUserTypes } from "../../utils/format-user.js";
import { getUsers } from "../../utils/get.js";
import type { Import } from "./checkUserAdmin.js";
import { MAX } from "./checkUserAdmin.js";

const multiCheckUserAdminFields = (
	parsedValue: {
		result: {
			user: {
				id: string;
				status: string;
			};
			imports: Import[];
		}[];
		page: number;
	},
	startIndex: number,
	endIndex: number,
) => {
	const types = (imports: Import[]) => {
		if (imports && imports.length > 0) {
			return formatUserTypes(
				imports.map((importItem) => ({
					...importItem,
					createdAt: new Date(importItem.createdAt),
					updatedAt: new Date(importItem.updatedAt),
				})),
			).join(", ");
		}
		return "No imports found";
	};

	const fields = [
		...parsedValue.result.slice(startIndex, endIndex).map(
			(data: {
				user: { id: string; status: string };
				imports: Import[];
			}) => ({
				name: "",
				value: `**<@${data.user.id}> (${data.user.id})**\n > Status: \`\`${data.user.status === "INVALID" ? "ID is invalid" : data.user.status === "NOTFOUND" ? "ID not found in database" : data.user.status === "BOT" ? "ID is from a bot" : formatStatus(data.user.status)}\`\`\n > Types: \`\`${types(data.imports)}\`\``,
				inline: false,
			}),
		),
	];

	return fields;
};

export const multiCheckUserAdminEmbed = async (
	interaction: Interaction,
	interactionId: string,
	direction?: string,
) => {
	const value = await getValue(`users:multi:${interactionId}`);
	const parsedValue = JSON.parse(value || "{}");

	if (!parsedValue || !parsedValue.result) {
		const embed = embedBuilder(
			"error",
			"Multi Check User",
			"❌ Ids not found.\n > Try again later.",
		);
		return interaction.respond({ embeds: [embed] }, { isPrivate: true }); // Use reply for errors
	}

	// Handle pagination logic
	const totalPages = Math.ceil(parsedValue.result.length / MAX);
	if (direction === "next" && parsedValue.page < totalPages - 1) {
		parsedValue.page++;
	} else if (direction === "prev" && parsedValue.page > 0) {
		parsedValue.page--;
	} else if (direction === "home") {
		parsedValue.page = 0;
	}

	// Calculate the start and end indices for the current page
	const startIndex = parsedValue.page * MAX;
	const endIndex = startIndex + MAX;

	// Generate fields for the current page
	const fields = multiCheckUserAdminFields(parsedValue, startIndex, endIndex);

	const embed = embedBuilder("warning", "Multi Check User", "", fields);

	// Save the updated page back to Redis
	await setValue(`users:multi:${interactionId}`, JSON.stringify(parsedValue));

	// Use reply for the first page, edit for subsequent pages
	if (!direction) {
		if (totalPages <= 1) {
			// If there are not enough imports for pagination, exclude buttons
			return interaction.respond({
				embeds: [embed],
			});
		}

		return interaction.respond({
			embeds: [embed],
			components: [
				{
					type: MessageComponentTypes.ActionRow,
					components: [
						{
							type: MessageComponentTypes.Button,
							label: "◀",
							customId: `multicheckuseradmin-prev-${interactionId}`,
							style: 1,
							disabled: true, // Disable on the first page
						},
						{
							type: MessageComponentTypes.Button,
							label: "🔄",
							customId: `multicheckuseradmin-home-${interactionId}`,
							style: 2,
							disabled: parsedValue.page === 0, // Disable if on the first page
						},
						{
							type: MessageComponentTypes.Button,
							label: "▶",
							customId: `multicheckuseradmin-next-${interactionId}`,
							style: 1,
							disabled: totalPages === 1, // Disable if only one page
						},
					],
				},
			],
		});
	}

	if (totalPages <= 1) {
		// If there are not enough imports for pagination, exclude buttons
		return interaction.edit({
			embeds: [embed],
		});
	}

	return interaction.edit({
		embeds: [embed],
		components: [
			{
				type: MessageComponentTypes.ActionRow,
				components: [
					{
						type: MessageComponentTypes.Button,
						label: "◀",
						customId: `multicheckuseradmin-prev-${interactionId}`,
						style: 1,
						disabled: parsedValue.page === 0, // Disable if on the first page
					},
					{
						type: MessageComponentTypes.Button,
						label: "🔄",
						customId: `multicheckuseradmin-home-${interactionId}`,
						style: 2,
						disabled: parsedValue.page === 0, // Disable if on the first page
					},
					{
						type: MessageComponentTypes.Button,
						label: "▶",
						customId: `multicheckuseradmin-next-${interactionId}`,
						style: 1,
						disabled: parsedValue.page === totalPages - 1, // Disable if on the last page
					},
				],
			},
		],
	});
};

const multiCheckUserAdminEmbedDisable = async (
	interaction: Interaction,
	interactionId: string,
) => {
	const value = await getValue(`users:multi:${interactionId}`);
	const parsedValue = JSON.parse(value || "{}");

	if (!parsedValue || !parsedValue.result) {
		const embed = embedBuilder(
			"error",
			"Multi Check User",
			"❌ Ids not found.\n > Try again later.",
		);
		return interaction.respond({ embeds: [embed] }, { isPrivate: true }); // Use reply for errors
	}

	// Calculate the start and end indices for the current page
	const startIndex = parsedValue.page * MAX;
	const endIndex = startIndex + MAX;

	// Generate fields for the current page
	const fields = multiCheckUserAdminFields(parsedValue, startIndex, endIndex);

	const embed = embedBuilder("warning", "Multi Check User", "", fields);

	return interaction.edit({
		embeds: [embed],
		components: [],
	});
};

const checkUserAdmindisableMultiEmbed = async (
	interaction: Interaction,
	interactionId: string,
) => {
	// Set a timeout to delete the value after 10 minutes and disable the embed
	setTimeout(
		async () => {
			multiCheckUserAdminEmbedDisable(
				interaction as unknown as Interaction,
				interactionId,
			);
			await deleteValue(`users:multi:${interactionId}`);
		},
		10 * 60 * 1000,
	);
};

createCommand({
	name: "multicheckuseradmin",
	description: "📋 Check multiple ids blacklists for staff.",
	defaultMemberPermissions: ["ADMINISTRATOR"],
	mainOnly: true,
	options: [
		{
			type: 3,
			name: "ids",
			description: "The ID's to check.",
			required: true,
		},
	],
	async run(interaction) {
		const noIdsEmbed = embedBuilder(
			"error",
			"Multi Check User",
			"❌ No ids found.\n > Please provide valid user ids.",
		);

		if (!interaction.data || !interaction.data.options) {
			return interaction.respond({ embeds: [noIdsEmbed] }, { isPrivate: true });
		}

		const idsOption = interaction.data?.options?.find(
			(option) => option.name === "ids",
		);

		if (!idsOption || !idsOption.value) {
			return interaction.respond({ embeds: [noIdsEmbed] }, { isPrivate: true });
		}

		const userIds = String(idsOption.value);
		const userIdsArray = userIds.split(",").map((id) => id.trim());

		if (!Array.isArray(userIdsArray)) {
			return interaction.respond({ embeds: [noIdsEmbed] }, { isPrivate: true });
		}

		const resultBotIds = [];
		const resultInvalidIds = [];
		const resultNotFoundIds = [];
		const resultFound = [];

		for (const id of userIdsArray) {
			try {
				const fetchUser = (await bot.helpers.getUser(id)) as User;
				if (fetchUser.toggles && fetchUser.toggles.bitfield === 1) {
					resultBotIds.push({
						user: {
							id: id,
							status: "BOT",
						},
						imports: [],
					});
					userIdsArray.splice(userIdsArray.indexOf(id), 1);
				}
			} catch {
				resultInvalidIds.push({
					user: {
						id: id,
						status: "INVALID",
					},
					imports: [],
				});
			}
		}

		const usersImports = await getUsers(userIdsArray);

		const foundUserIds = usersImports.map((user) => user.user?.id);
		const notFoundIds = userIdsArray.filter((id) => !foundUserIds.includes(id));

		for (const id of notFoundIds) {
			if (!resultInvalidIds.find((user) => user.user.id === id)) {
				resultNotFoundIds.push({
					user: {
						id: id,
						status: "NOTFOUND",
					},
					imports: [],
				});
			}
		}

		for (const userImport of usersImports) {
			resultFound.push(userImport);
		}

		const result = [
			...resultFound,
			...resultNotFoundIds,
			...resultInvalidIds,
			...resultBotIds,
		];

		setValue(
			`users:multi:${interaction.id}`,
			JSON.stringify({ result, page: 0 }),
		);

		checkUserAdmindisableMultiEmbed(
			interaction as unknown as Interaction,
			String(interaction.id),
		);

		return multiCheckUserAdminEmbed(
			interaction as unknown as Interaction,
			String(interaction.id),
		);
	},
});
