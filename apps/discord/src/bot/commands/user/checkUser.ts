import type { Interaction } from "@discordeno/bot";
import type { User } from "@discordeno/bot";
import { bot } from "../../bot.js";
import createCommand from "../../commands.js";
import { en } from "../../locales/en.js";
import embedBuilder from "../../utils/embed.js";
import { formatStatus } from "../../utils/format-status.js";
import { formatUserTypes } from "../../utils/format-user.js";
import { getUser } from "../../utils/get-user.js";
import type { UserData } from "../../utils/get-user.js";

export const checkUserHandler = async (
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

	const userData: UserData | undefined = await getUser(userId, false).catch(
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
		return interaction.respond(
			{ embeds: [notBlacklistedEmbed] },
			{ isPrivate: true },
		);
	}

	if (
		userData.user.status !== "BLACKLISTED" &&
		userData.user.status !== "PERM_BLACKLISTED"
	) {
		return interaction.respond(
			{ embeds: [notBlacklistedEmbed] },
			{ isPrivate: true },
		);
	}

	if (userData.imports && userData.imports.length === 0) {
		// @TODO: appeal user
	}

	if (!userData.imports || userData.imports.length === 0) {
		return interaction.respond(
			{ embeds: [notBlacklistedEmbed] },
			{ isPrivate: true },
		);
	}

	const descriptions = en as Record<string, string>;
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

	for (const type of types) {
		const description =
			descriptions[`${type.toLowerCase()}_description`] ||
			"No description available.";
		fields.push({
			inline: false,
			name: type,
			value: `\`\`\`${description}\`\`\``,
		});
	}

	const embed = embedBuilder(
		"warning",
		"Check User",
		`⚠️ <@${userId}> is blacklisted. They have been seen in ${userData.imports.length} server${
			userData.imports.length > 1 ? "s" : ""
		}.`,
		fields,
	);

	return interaction.respond({ embeds: [embed] });
};

createCommand({
	name: "checkuser",
	description: "📋 Check if a user is blacklisted.",
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

		const userOption = interaction.data.options.find(
			(option) => option.name === "user",
		);

		if (!userOption || !userOption.value) {
			return interaction.respond({ embeds: [noValidUserEmbed] });
		}

		const userId = String(userOption.value);
		return await checkUserHandler(
			interaction as unknown as Interaction,
			userId,
		);
	},
});
