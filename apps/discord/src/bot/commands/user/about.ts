import createCommand from "../../commands.js";
import { en } from "../../locales/index.js";
import embedBuilder from "../../utils/embed.js";

createCommand({
	name: "about",
	description: "📢 Get information about the bot.",
	async run(interaction) {
		const embed = embedBuilder("info", "About Warden", en.about);
		return interaction.respond({ embeds: [embed] });
	},
});
