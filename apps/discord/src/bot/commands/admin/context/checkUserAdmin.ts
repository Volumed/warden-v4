import type { Interaction } from "@discordeno/bot";
import { ApplicationCommandTypes } from "@discordeno/bot";
import createCommand from "../../../commands.js";
import { setValue } from "../../../redis/redis-client.js";
import embedBuilder from "../../../utils/embed.js";
import { checkUserAdminHandler } from "../checkUserAdmin.js";
import {
	MAX,
	checkUserAdminEmbed,
	checkUserAdmindisableEmbed,
} from "../checkUserAdmin.js";

createCommand({
	name: "Check User Admin",
	type: ApplicationCommandTypes.User,
	defaultMemberPermissions: ["ADMINISTRATOR"],
	mainOnly: true,
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
		const result = await checkUserAdminHandler(
			interaction as unknown as Interaction,
			userId,
		);
		if (Array.isArray(result) && result.length === 0) return;

		if (
			!result ||
			typeof result !== "object" ||
			!("userData" in result) ||
			!result.userData.imports ||
			!("fields" in result) ||
			!("noteCount" in result)
		) {
			return;
		}

		setValue(
			`user:${userId}:blacklist:${interaction.id}`,
			JSON.stringify({ result, page: 0 }),
		);

		checkUserAdmindisableEmbed(
			interaction as unknown as Interaction,
			userId,
			String(interaction.id),
		);

		return await checkUserAdminEmbed(
			interaction as unknown as Interaction,
			userId,
			String(interaction.id),
		);
	},
});
