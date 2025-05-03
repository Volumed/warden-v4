import {
	ApplicationCommandTypes,
	MessageComponentTypes,
	createEmbeds,
} from "@discordeno/bot";
import createCommand from "../../commands.js";

// Placeholder objects for emojis and configs
const randomEmojis = {
	emojiduvida: "❓",
	emojicerto: "✅",
	emojisetinha: "➡️",
};

const randomConfigs = {
	color: "#7289DA",
	image: "https://example.com/image.png",
};

createCommand({
	name: "select",
	description: "Lorem ipsum dolor sit amet.",
	async run(interaction) {
		const menu = {
			type: MessageComponentTypes.SelectMenu as MessageComponentTypes.SelectMenu,
			placeholder: "Lorem ipsum dolor sit amet.",
			customId: "lorem_ipsum_custom_id",
			options: [
				{
					label: "Lorem ipsum dolor sit amet?",
					description:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
					emoji: {
						id: BigInt("1269443633027743806"),
						name: "direita",
						animated: true,
					},
					value: "lorem_ipsum_1",
				},
				{
					label: "Lorem ipsum dolor sit amet.",
					description:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
					emoji: {
						id: BigInt("1269443633027743806"),
						name: "direita",
						animated: true,
					},
					value: "lorem_ipsum_2",
				},
				{
					label: "Lorem ipsum dolor sit amet!",
					description:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
					emoji: {
						id: BigInt("1269443633027743806"),
						name: "direita",
						animated: true,
					},
					value: "lorem_ipsum_3",
				},
				{
					label: "Lorem ipsum dolor sit amet!",
					description:
						"Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
					emoji: {
						id: BigInt("1269443633027743806"),
						name: "direita",
						animated: true,
					},
					value: "lorem_ipsum_4",
				},
			],
		};
		const embedexplicação = createEmbeds()
			.newEmbed()
			.setTitle(`${randomEmojis.emojiduvida} | Lorem Ipsum`)
			.setDescription(
				`${randomEmojis.emojicerto} | Lorem ipsum dolor sit amet, consectetur adipiscing elit. \n\n ${randomEmojis.emojisetinha} | **Lorem ipsum dolor sit amet, consectetur adipiscing elit.**`,
			)
			.setColor(randomConfigs.color)
			.setThumbnail(randomConfigs.image)
			.setFooter("Lorem Ipsum");
		interaction.respond({
			embeds: embedexplicação,
			components: [
				{
					type: MessageComponentTypes.ActionRow,
					components: [menu],
				},
			],
		});
	},
});
