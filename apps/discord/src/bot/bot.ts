import { Collection, createBot, type logger } from "@discordeno/bot";
import {
	DISCORD_TOKEN,
	GATEWAY_AUTHORIZATION,
	GATEWAY_INTENTS,
	GATEWAY_URL,
	REST_AUTHORIZATION,
	REST_URL,
} from "../config.js";
import type {
	ManagerGetShardInfoFromGuildId,
	ShardInfo,
	WorkerPresencesUpdate,
	WorkerShardPayload,
} from "../gateway/worker/types.js";
import type { Command } from "./commands.js";

const rawBot = createBot({
	token: DISCORD_TOKEN,
	intents: GATEWAY_INTENTS,
	// TEMPLATE-SETUP: Add/Remove the desired properties that you don't need
	desiredProperties: {
		interaction: {
			type: true,
			data: true,
			guildId: true,
			guild: true,
			token: true,
			id: true,
			message: true,
			member: true,
			user: true,
			context: true,
		},
		member: {
			id: true,
			roles: true,
			nick: true,
			user: true,
			guildId: true,
			joinedAt: true,
		},
		user: {
			id: true,
			username: true,
			avatar: true,
			toggles: true,
		},
		attachment: {
			contentType: true,
		},
		role: {
			id: true,
			name: true,
		},
		guild: {
			id: true,
			name: true,
			members: true,
			shardId: true,
			ownerId: true,
			icon: true,
			iconHash: true,
			toggles: true,
		},
		channel: {
			id: true,
			guildId: true,
			name: true,
		},
		message: {
			components: true,
			embeds: true,
			attachments: true,
			content: true,
			channelId: true,
			author: true,
			guildId: true,
			id: true,
			member: true,
			reactions: true,
			messageReference: true,
			interaction: true,
		},
		emoji: {
			name: true,
		},
		interactionCallbackResponse: { resource: true },
		interactionResource: {
			message: true,
		},
	},
	rest: {
		token: DISCORD_TOKEN,
		proxy: {
			baseUrl: REST_URL,
			authorization: REST_AUTHORIZATION,
		},
	},
});

export const bot = rawBot as CustomBot;

// TEMPLATE-SETUP: If you want/need to add any custom properties on the Bot type, you can do it in these lines below and the `CustomBot` type below. Make sure to do it in both or else you will get an error by TypeScript
// We need to set the log depth for the default discordeno logger or else only the first param will be logged
const getAvatarHash = async () => {
	const user = await bot.helpers.getUser(bot.id).catch((error) => {
		bot.logger.error("Error fetching user data", error);
	});
	if (user) {
		return user.avatar;
	}
};

export const botAvatarHash = await getAvatarHash();

bot.commands = new Collection();

overrideGatewayImplementations(bot);

export type CustomBot = typeof rawBot & {
	commands: Collection<string, Command>;
};

// Override the default gateway functions to allow the methods on the gateway object to proxy the requests to the gateway proxy
function overrideGatewayImplementations(bot: CustomBot): void {
	bot.gateway.sendPayload = async (shardId, payload) => {
		await fetch(GATEWAY_URL, {
			method: "POST",
			body: JSON.stringify({
				type: "ShardPayload",
				shardId,
				payload,
			} satisfies WorkerShardPayload),
			headers: {
				"Content-Type": "application/json",
				Authorization: GATEWAY_AUTHORIZATION,
			},
		});
	};

	bot.gateway.editBotStatus = async (payload) => {
		await fetch(GATEWAY_URL, {
			method: "POST",
			body: JSON.stringify({
				type: "EditShardsPresence",
				payload,
			} satisfies WorkerPresencesUpdate),
			headers: {
				"Content-Type": "application/json",
				Authorization: GATEWAY_AUTHORIZATION,
			},
		});
	};
}

export async function getShardInfoFromGuild(
	guildId?: bigint,
): Promise<Omit<ShardInfo, "nonce">> {
	const req = await fetch(GATEWAY_URL, {
		method: "POST",
		body: JSON.stringify({
			type: "ShardInfoFromGuild",
			guildId: guildId?.toString(),
		} as ManagerGetShardInfoFromGuildId),
		headers: {
			"Content-Type": "application/json",
			Authorization: GATEWAY_AUTHORIZATION,
		},
	});

	const res = await req.json();

	if (req.ok) return res;

	throw new Error(`There was an issue getting the shard info: ${res.error}`);
}
