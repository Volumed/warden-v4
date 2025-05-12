import { MessageComponentTypes } from "@discordeno/bot";
import type { Interaction } from "@discordeno/bot";
import type { User } from "@discordeno/bot";
import { countNotesByUserId } from "@warden/database";
import { bot } from "../../bot.js";
import createCommand from "../../commands.js";
import { deleteValue, getValue, setValue } from "../../redis/redis-client.js";
import embedBuilder from "../../utils/embed.js";
import { formatServerType } from "../../utils/format-server.js";
import { formatStatus } from "../../utils/format-status.js";
import { formatUserType } from "../../utils/format-user.js";
import { formatUserTypes } from "../../utils/format-user.js";
import { getUser } from "../../utils/get-user.js";
import type { UserData } from "../../utils/get-user.js";

interface Server {
	serverId: string;
	roles: string[];
	type: string;
	appealed: boolean;
	createdAt: string;
	updatedAt: string;
	badServer: {
		name: string;
		type: string;
	};
}

export const MAX = 5;

export const checkUserAdminHandler = async (
	interaction: Interaction,
	id: string,
) => {
	const userId = String(id);

	let fetchUser: User | undefined;
	try {
		fetchUser = (await bot.helpers.getUser(userId)) as User;
	} catch (error) {
		bot.logger.error("Error fetching user data", error);
		const embed = embedBuilder(
			"error",
			"Check User",
			`❌ An error occurred while fetching <@${userId}>.\n > Please try again later.`,
		);
		return interaction.respond({ embeds: [embed] }, { isPrivate: true });
	}

	if (fetchUser.toggles && fetchUser.toggles.bitfield === 1) {
		return interaction.respond(
			{
				embeds: [
					embedBuilder(
						"info",
						"Check User",
						`🤖 <@${userId}> is identified as a bot.\n > User checks cannot be performed on bots.`,
					),
				],
			},
			{ isPrivate: true },
		);
	}

	const userData: UserData | undefined = await getUser(userId, true).catch(
		(error) => {
			bot.logger.error("Error fetching user data", error);
			const embed = embedBuilder(
				"error",
				"Check User",
				`❌ An error occurred while fetching <@${userId}>.\n > Please try again later.`,
			);
			interaction.respond({ embeds: [embed] }, { isPrivate: true });
			return undefined;
		},
	);

	const notBlacklistedEmbed = embedBuilder(
		"info",
		"Check User",
		`✅ <@${userId}> is not blacklisted.\n > They are either fine or not yet listed.`,
	);

	if (!userData || !userData.user) {
		return interaction.respond({ embeds: [notBlacklistedEmbed] });
	}

	if (
		userData.user.status !== "BLACKLISTED" &&
		userData.user.status !== "PERM_BLACKLISTED"
	) {
		return interaction.respond({ embeds: [notBlacklistedEmbed] });
	}

	if (userData.imports && userData.imports.length === 0) {
		// @TODO: appeal user
	}

	if (!userData.imports || userData.imports.length === 0) {
		return interaction.respond({ embeds: [notBlacklistedEmbed] });
	}

	const types = formatUserTypes(userData.imports);

	const fields = [
		{
			inline: true,
			name: "Status:",
			value: `\`\`${formatStatus(userData.user.status)}\`\``,
		},
		{
			inline: true,
			name: "Types:",
			value: `\`\`${types.join(", ")}\`\``,
		},
	];

	const noteCount = await countNotesByUserId(userId).catch((error) => {
		bot.logger.error("Error fetching user notes", error);
		return 0;
	});

	return {
		fields,
		userData,
		noteCount,
	};
};

const checkUserAdminFields = (
	parsedValue: {
		result: {
			userData: {
				imports: Server[];
				user: {
					appeals: number;
				};
			};
			fields: { name: string; value: string; inline?: boolean }[];
			noteCount: number;
		};
	},
	userId: string,
	startIndex: number,
	endIndex: number,
) => {
	const fields = [
		{
			name: "Information:",
			value: `> **ID**: \`\`${userId}\`\`\n > **Appeals**: \`\`${parsedValue?.result?.userData?.user?.appeals || 0}\`\`\n > **Notes**: \`\`${parsedValue?.result?.noteCount || 0}\`\`\n > **History**: \`\`N/A\`\``,
			inline: false,
		},
		...parsedValue.result.fields,
		{
			name: "Found in Servers:",
			value: "",
			inline: false,
		},
		...parsedValue.result.userData.imports
			.slice(startIndex, endIndex)
			.filter((server: Server) => !server.appealed)
			.map((server: Server) => ({
				name: `${server.badServer.name} (${server.serverId}) - ${formatServerType(server.badServer.type)}`,
				value: `> **Type:** ${formatUserType(server.type)}\n> **Roles:** ${server.roles.join(", ")}\n> **First Seen:** <t:${Math.floor(
					new Date(server.createdAt).getTime() / 1000,
				)}:D>\n> **Last Seen:** <t:${Math.floor(
					new Date(server.updatedAt).getTime() / 1000,
				)}:D>`,
				inline: false,
			})),
	];

	return fields;
};

const checkUserAdminEmbedDisable = async (
	interaction: Interaction,
	userId: string,
	interactionId: string,
) => {
	const value = await getValue(`user:${userId}:blacklist:${interactionId}`);
	const parsedValue = JSON.parse(value || "{}");

	if (!parsedValue || !parsedValue.result) {
		const embed = embedBuilder(
			"error",
			"Check User",
			"❌ User not found.\n > Try again later.",
		);
		return interaction.respond({ embeds: [embed] }, { isPrivate: true }); // Use reply for errors
	}

	// Calculate the start and end indices for the current page
	const startIndex = parsedValue.page * MAX;
	const endIndex = startIndex + MAX;

	// Generate fields for the current page
	const fields = checkUserAdminFields(
		parsedValue,
		userId,
		startIndex,
		endIndex,
	);

	const embed = embedBuilder(
		"warning",
		"Check User",
		`⚠️ <@${userId}> is blacklisted. They have been seen in ${parsedValue.result.userData.imports.length} server${
			parsedValue.result.userData.imports.length > 1 ? "s" : ""
		}.`,
		fields,
	);

	return interaction.edit({
		embeds: [embed],
		components: [],
	});
};

export const checkUserAdminEmbed = async (
	interaction: Interaction,
	userId: string,
	interactionId: string,
	direction?: string,
) => {
	const value = await getValue(`user:${userId}:blacklist:${interactionId}`);
	const parsedValue = JSON.parse(value || "{}");

	if (!parsedValue || !parsedValue.result) {
		const embed = embedBuilder(
			"error",
			"Check User",
			"❌ User not found.\n > Try again later.",
		);
		return interaction.respond({ embeds: [embed] }, { isPrivate: true }); // Use reply for errors
	}

	// Handle pagination logic
	const totalPages = Math.ceil(
		parsedValue.result.userData.imports.length / MAX,
	);
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
	const fields = checkUserAdminFields(
		parsedValue,
		userId,
		startIndex,
		endIndex,
	);

	const embed = embedBuilder(
		"warning",
		"Check User",
		`⚠️ <@${userId}> is blacklisted. They have been seen in ${parsedValue.result.userData.imports.length} server${
			parsedValue.result.userData.imports.length > 1 ? "s" : ""
		}.`,
		fields,
	);

	// Save the updated page back to Redis
	await setValue(
		`user:${userId}:blacklist:${interactionId}`,
		JSON.stringify(parsedValue),
	);

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
							customId: `checkuseradmin-prev-${interactionId}-${userId}`,
							style: 1,
							disabled: true, // Disable on the first page
						},
						{
							type: MessageComponentTypes.Button,
							label: "🔄",
							customId: `checkuseradmin-home-${interactionId}-${userId}`,
							style: 2,
							disabled: parsedValue.page === 0, // Disable if on the first page
						},
						{
							type: MessageComponentTypes.Button,
							label: "▶",
							customId: `checkuseradmin-next-${interactionId}-${userId}`,
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
						customId: `checkuseradmin-prev-${interactionId}-${userId}`,
						style: 1,
						disabled: parsedValue.page === 0, // Disable if on the first page
					},
					{
						type: MessageComponentTypes.Button,
						label: "🔄",
						customId: `checkuseradmin-home-${interactionId}-${userId}`,
						style: 2,
						disabled: parsedValue.page === 0, // Disable if on the first page
					},
					{
						type: MessageComponentTypes.Button,
						label: "▶",
						customId: `checkuseradmin-next-${interactionId}-${userId}`,
						style: 1,
						disabled: parsedValue.page === totalPages - 1, // Disable if on the last page
					},
				],
			},
		],
	});
};

export const checkUserAdmindisableEmbed = async (
	interaction: Interaction,
	userId: string,
	totalPages: number,
) => {
	// Set a timeout to delete the value after 10 minutes and disable the embed
	if (totalPages !== 1) {
		setTimeout(
			async () => {
				checkUserAdminEmbedDisable(
					interaction as unknown as Interaction,
					userId,
					String(interaction.id),
				);
				await deleteValue(`user:${userId}:blacklist:${interaction.id}`);
			},
			10 * 60 * 1000,
		);
	}
};

createCommand({
	name: "checkuseradmin",
	description: "📋 Check user blacklist for staff.",
	defaultMemberPermissions: ["ADMINISTRATOR"],
	mainOnly: true,
	options: [
		{
			type: 6,
			name: "user",
			description: "The user or ID to check.",
			required: true,
		},
	],
	async run(interaction) {
		const noValidUserEmbed = embedBuilder(
			"error",
			"Check User",
			"❌ User not found.\n > Please provide a valid user.",
		);

		if (!interaction.data || !interaction.data.options) {
			return interaction.respond(
				{ embeds: [noValidUserEmbed] },
				{ isPrivate: true },
			);
		}

		const userOption = interaction.data?.options?.find(
			(option) => option.name === "user",
		);

		if (!userOption || !userOption.value) {
			return interaction.respond(
				{ embeds: [noValidUserEmbed] },
				{ isPrivate: true },
			);
		}

		const userId = String(userOption.value);
		const result = await checkUserAdminHandler(
			interaction as unknown as Interaction,
			userId,
		);

		if (
			!result ||
			typeof result !== "object" ||
			!("userData" in result) ||
			!result.userData.imports ||
			!("fields" in result) ||
			!("noteCount" in result)
		) {
			bot.logger.error(`[Check User Admin] Error: ${JSON.stringify(result)}`, {
				userId,
				interactionId: interaction.id,
			});
			return interaction.respond(
				{ embeds: [noValidUserEmbed] },
				{ isPrivate: true },
			);
		}

		setValue(
			`user:${userId}:blacklist:${interaction.id}`,
			JSON.stringify({ result, page: 0 }),
		);

		const totalPages = Math.ceil(result.userData.imports.length / MAX);
		checkUserAdmindisableEmbed(
			interaction as unknown as Interaction,
			userId,
			totalPages,
		);

		return await checkUserAdminEmbed(
			interaction as unknown as Interaction,
			userId,
			String(interaction.id),
		);
	},
});
