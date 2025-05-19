import type { EmbedField } from "@discordeno/bot";
import { applicationIconUrl } from "@discordeno/bot";
import { bot, botAvatarHash } from "../bot.js";
import colors from "./colors.js";

/**
 * Create an embed with the info color
 * @param type The type of the embed
 * @param title The title of the embed
 * @param description The description of the embed
 * @param fields The fields of the embed
 * @returns The embed
 */
const embedBuilder = (
	type: string,
	title: string,
	description?: string,
	fields?: EmbedField[],
) => {
	return {
		title: title,
		description: description,
		color:
			type === "info"
				? colors.blue
				: type === "success"
					? colors.green
					: type === "warning"
						? colors.orange
						: colors.red,
		fields: fields,
		timestamp: new Date().toISOString(),
		footer: {
			text: "Warden",
			icon_url: applicationIconUrl(bot.applicationId, botAvatarHash),
		},
	};
};

export default embedBuilder;
