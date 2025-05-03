import { ApplicationCommandTypes, snowflakeToTimestamp } from "@discordeno/bot";
import { getShardInfoFromGuild } from "../../bot.js";
import createCommand from "../../commands.js";

createCommand({
	name: "context",
	type: ApplicationCommandTypes.User,
	async run(interaction) {
		console.log(interaction.data?.targetId);
		const ping = Date.now() - snowflakeToTimestamp(interaction.id);
		const shardInfo = await getShardInfoFromGuild(interaction.guildId);

		const shardPing =
			shardInfo.rtt === -1 ? "*Not yet available*" : `${shardInfo.rtt}ms`;

		await interaction.respond(
			`🏓 Pong! Gateway Latency: ${shardPing}, Roundtrip Latency: ${ping}ms. I am online and responsive! 🕙`,
		);
	},
});
