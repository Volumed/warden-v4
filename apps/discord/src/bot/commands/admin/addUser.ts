import type { Interaction } from "@discordeno/bot";
import { bot } from "../../bot.js";
import createCommand from "../../commands.js";
import embedBuilder from "../../utils/embed.js";

createCommand({
	name: "adduser",
	description: "🛡️ Add user to blacklist for staff.",
	defaultMemberPermissions: ["ADMINISTRATOR"],
	mainOnly: true,
	options: [
		{
			type: 6,
			name: "user",
			description: "The user or ID to add.",
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
	},
});
