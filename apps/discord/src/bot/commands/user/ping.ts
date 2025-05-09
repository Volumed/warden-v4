import { snowflakeToTimestamp } from "@discordeno/bot";
import { checkDbConnection } from "database/dist/index.js";
import { getShardInfoFromGuild } from "../../bot.js";
import createCommand from "../../commands.js";
import { checkRedisHealth } from "../../redis/redis-client.js";

createCommand({
	name: "ping",
	description: "🏓 Check whether the bot is online and responsive.",
	async run(interaction) {
		const ping = Date.now() - snowflakeToTimestamp(interaction.id);
		const shardInfo = await getShardInfoFromGuild(interaction.guildId);
		const dbConnection = await checkDbConnection();
		const redisHealth = await checkRedisHealth();

		const shardPing =
			shardInfo.rtt === -1 ? "*Not yet available*" : `${shardInfo.rtt}ms`;

		const dbStatus = dbConnection.connected
			? `Connected (Latency: ${dbConnection.latency}ms)`
			: "Disconnected";

		const redisStatus = redisHealth ? "Healthy" : "Unhealthy";

		const overallStatus =
			dbConnection.connected && redisHealth
				? "I am online and responsive!"
				: "Some services are experiencing issues.";

		await interaction.respond(
			`🏓 Pong! Gateway Latency: ${shardPing}, Roundtrip Latency: ${ping}ms, Database Status: ${dbStatus}, Redis Status: ${redisStatus}. ${overallStatus}`,
		);
	},
});
