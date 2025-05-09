import assert from "node:assert";
import { MAIN_SERVER_ID } from "../../config.js";
import { bot } from "../bot.js";

export async function updateCommands(): Promise<void> {
	bot.logger.info("Updating commands");

	const userCommands = bot.commands.filter((x) => !x.mainOnly).array();
	await bot.helpers.upsertGlobalApplicationCommands(userCommands);

	assert(MAIN_SERVER_ID, "The MAIN_SERVER_ID environment is missing");

	bot.logger.info("Updating main commands");

	const mainCommands = bot.commands.filter((x) => x.mainOnly ?? false).array();
	await bot.helpers.upsertGuildApplicationCommands(
		MAIN_SERVER_ID,
		mainCommands,
	);
}
