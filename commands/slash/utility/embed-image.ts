import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, TextChannel } from "discord.js";
import config from "../../../config.json";
import { isValidColorHex } from "../../../util/herper-functions";

export default {
    subCommand: 'embed.image',
    callback: async (interaction: ChatInputCommandInteraction) => {
        const color = interaction.options.getString('color', false);
        const channel = interaction.options.getChannel('channel', false) as TextChannel;
        const image = interaction.options.getAttachment('image', true);

        if (!image.contentType?.startsWith('image')) {
            const errorEmbed = new EmbedBuilder()
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: 'Invalid file type', iconURL: config.embeds.images.errorImg });
            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const imageEmbed = new EmbedBuilder();

        if (color && !isValidColorHex(color)) {
            const errorEmbed = new EmbedBuilder()
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: 'Invalid Color hexadecimal', iconURL: config.embeds.images.errorImg });
            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        } else {
            imageEmbed.setColor(color as ColorResolvable);
        }

        imageEmbed.setImage(image.url);

        if (channel) {
            await channel.send({ embeds: [imageEmbed] });
        } else {
            await interaction.channel?.send({ embeds: [imageEmbed] });
        }

        await interaction.reply({ content: "Embed sent successfully", ephemeral: true });
    }
}