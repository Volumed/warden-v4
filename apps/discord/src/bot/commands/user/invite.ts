import createCommand from "../../commands.js";
import { en } from "../../locales/index.js";
import embedBuilder from "../../utils/embed.js";

createCommand({
	name: "invite",
	description: "🚪 Get the bot invite link.",
	async run(interaction) {
		const embed = embedBuilder("info", "Invite Warden", en.invite);
		return interaction.respond({ embeds: [embed] });
	},
});
