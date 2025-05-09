import type { Interaction } from "@discordeno/bot";
import { ApplicationCommandTypes } from "@discordeno/bot";
import createCommand from "../../../commands.js";
import embedBuilder from "../../../utils/embed.js";
import { checkUserHandler } from "../checkUser.js";

createCommand({
	name: "Check User",
	type: ApplicationCommandTypes.User,
	async run(interaction) {
		const noValidUserEmbed = embedBuilder(
			"error",
			"Check User",
			"❌ User not found.\n > Please provide a valid user.",
		);

		if (!interaction.data?.targetId) {
			return interaction.respond({ embeds: [noValidUserEmbed] });
		}

		const userId = String(interaction.data?.targetId);
		checkUserHandler(interaction as unknown as Interaction, userId);
	},
});
