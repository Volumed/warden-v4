import type { EmbedField } from "@discordeno/bot";
import { applicationIconUrl } from "@discordeno/bot";
import { bot, botAvatarHash } from "../bot.js";

const colors = {
	blue: 0xb7c9cf, // #b7c9cf
	green: 0x99ff99, // #99ff99
	orange: 0xffd1b3, // #ffd1b3
	red: 0xffb3b3, // #ffb3b3
};

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
