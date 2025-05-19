import { MessageComponentTypes, MessageFlags } from "@discordeno/bot";
import { applicationIconUrl } from "@discordeno/bot";
import { countBadServers, countBlacklistedUsers } from "@warden/database";
import { checkDbConnection } from "@warden/database";
import { MAIN_SERVER_ID, STATUS_CHANNEL_ID } from "../../config.js";
import { bot, botAvatarHash, getShardInfoFromGuild } from "../bot.js";
import { checkRedisHealth } from "../redis/redis-client.js";
import colors from "../utils/colors.js";

let previousBlacklistedUsers = 0;

export const startTime = Date.now();

const statusComponent = async (lastUpdateTime: number) => {
	const totalShards = bot.gateway.shards.size;
	const bearerToken = bot.rest.token;
	const getGuilds = bot.helpers.getGuilds(bearerToken);
	const totalGuilds = (await getGuilds).length;
	const totalBadServers = await countBadServers();
	const totalBlacklistedUsers = await countBlacklistedUsers();
	const newBlacklistedUsers =
		previousBlacklistedUsers === 0
			? 0
			: Math.max(0, Number(totalBlacklistedUsers) - previousBlacklistedUsers);
	previousBlacklistedUsers = Number(totalBlacklistedUsers);
	const memmoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
		2,
	);
	const nextUpdateTime = lastUpdateTime + 300000;
	const redisHealth = await checkRedisHealth();
	const redisStatus = redisHealth ? "Healthy" : "Unhealthy";
	const shardInfo = await getShardInfoFromGuild(
		BigInt(MAIN_SERVER_ID as string),
	);
	const shardPing =
		shardInfo.rtt === -1 ? "*Not yet available*" : `${shardInfo.rtt}ms`;
	const dbConnection = await checkDbConnection();
	const dbStatus = dbConnection.connected
		? `Connected (Latency: ${dbConnection.latency}ms)`
		: "Disconnected";

	return [
		{
			type: MessageComponentTypes.Container as MessageComponentTypes.Container,
			accentColor: colors.blue,
			components: [
				{
					type: MessageComponentTypes.Section as MessageComponentTypes.Section,
					components: [
						{
							type: MessageComponentTypes.TextDisplay as MessageComponentTypes.TextDisplay,
							content: "# Warden Statistics",
						},
					],
					accessory: {
						type: MessageComponentTypes.Thumbnail as MessageComponentTypes.Thumbnail,
						media: {
							url: applicationIconUrl(bot.applicationId, botAvatarHash) ?? "",
						},
					},
				},
				{
					type: MessageComponentTypes.Separator as MessageComponentTypes.Separator,
					spacing: 2,
				},
				{
					type: MessageComponentTypes.TextDisplay as MessageComponentTypes.TextDisplay,
					content: `### General Statistics\n > Gateway Latency: \`\`${shardPing}\`\`\n > Redis: \`\`${redisStatus}\`\`\n > \`\`${totalShards}\`\` shards\n > \`\`${totalGuilds}\`\` servers are protected\n > \`\`0\`\` users in the queue\n > \`\`0\`\` users processed`,
				},
				{
					type: MessageComponentTypes.TextDisplay as MessageComponentTypes.TextDisplay,
					content: `### Database Statistics\n > Database: \`\`${dbStatus}\`\`\n > \`\`${totalBadServers}\`\` blacklisted servers\n > \`\`${totalBlacklistedUsers}\`\` blacklisted users\n > \`\`${newBlacklistedUsers}\`\` new blacklisted users since update`,
				},
				{
					type: MessageComponentTypes.TextDisplay as MessageComponentTypes.TextDisplay,
					content: `### Bot Statistics\n > Uptime <t:${Math.floor(
						new Date(startTime).getTime() / 1000,
					)}:R>\n > Usage \`\`${memmoryUsage}\`\` MB`,
				},
				{
					type: MessageComponentTypes.Separator as MessageComponentTypes.Separator,
					spacing: 2,
				},
				{
					type: MessageComponentTypes.TextDisplay as MessageComponentTypes.TextDisplay,
					content: `Next update <t:${Math.floor(nextUpdateTime / 1000)}:R>`,
				},
			],
		},
	];
};

const statusMessage = async () => {
	if (!STATUS_CHANNEL_ID) {
		bot.logger.warn("STATUS_CHANNEL_ID is not set, skipping status update");
		return;
	}

	const lastUpdateTime = Date.now();

	try {
		const messages = await bot.helpers.getMessages(STATUS_CHANNEL_ID, {
			limit: 1,
		});
		if (messages.length > 0) {
			await bot.helpers.editMessage(STATUS_CHANNEL_ID, messages[0].id, {
				flags: MessageFlags.IsComponentV2,
				components: await statusComponent(lastUpdateTime),
			});
		} else {
			await bot.helpers.sendMessage(STATUS_CHANNEL_ID, {
				flags: MessageFlags.IsComponentV2,
				components: await statusComponent(lastUpdateTime),
			});
		}
	} catch (error) {
		if (error instanceof Error) {
			bot.logger.error(`Failed to update status: ${error.message}`);
		} else {
			bot.logger.error("Failed to update status: Unknown error");
		}
	}
};

const status = () => {
	if (!STATUS_CHANNEL_ID) {
		bot.logger.warn("STATUS_CHANNEL_ID is not set, skipping status updates");
		return;
	}

	statusMessage();

	// Update the status every 5 minutes (300000 ms)
	setInterval(() => statusMessage(), 300000);
};

export default status;
