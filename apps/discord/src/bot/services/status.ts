import { countBadServers, countBlacklistedUsers } from "@warden/database";
import { STATUS_CHANNEL_ID } from "../../config.js";
import { bot } from "../bot.js";
import embedBuilder from "../utils/embed.js";

let previousBlacklistedUsers = 0;

export const startTime = Date.now();

const statusEmbed = async (lastUpdateTime: number) => {
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

	const fields = [
		{
			inline: false,
			name: "General Statistics",
			value: `> \`\`${totalShards}\`\` shards\n > \`\`${totalGuilds}\`\` servers are protected\n > \`\`0\`\` users in the queue\n > \`\`0\`\` users processed`,
		},
		{
			inline: false,
			name: "Database Statistics",
			value: `> \`\`${totalBadServers}\`\` blacklisted servers\n > \`\`${totalBlacklistedUsers}\`\` blacklisted users\n > \`\`${newBlacklistedUsers}\`\` new blacklisted users since update`,
		},
		{
			inline: false,
			name: "Bot Statistics",
			value: `> Uptime <t:${Math.floor(
				new Date(startTime).getTime() / 1000,
			)}:R>\n > Usage \`\`${memmoryUsage}\`\` MB`,
		},
		{
			inline: false,
			name: "Next Update",
			value: `> Next update <t:${Math.floor(nextUpdateTime / 1000)}:R>`,
		},
	];

	return embedBuilder("info", "Statistics & Information", "", fields);
};

const updateStatus = async () => {
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
				embeds: [await statusEmbed(lastUpdateTime)],
			});
		} else {
			await bot.helpers.sendMessage(STATUS_CHANNEL_ID, {
				embeds: [await statusEmbed(lastUpdateTime)],
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

	updateStatus();

	// Update the status every 5 minutes (300000 ms)
	setInterval(() => updateStatus(), 300000);
};

export default status;
