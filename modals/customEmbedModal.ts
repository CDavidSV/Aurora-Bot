import { ColorResolvable, Embed, EmbedBuilder, ModalSubmitInteraction, TextChannel } from "discord.js";
import { isValidURL } from "../util/herper-functions";
import config from "../config.json";

export default {
    name: 'customEmbedModal',
    callback: async (interaction: ModalSubmitInteraction) => {
        const channel = interaction.guild!.channels.cache.get(interaction.customId.split('.')[1]) as TextChannel || null;
        const color = interaction.customId.split('.')[2] || null;
        const timestamp = interaction.customId.split('.')[3];

        let title: string | null = interaction.fields.getTextInputValue('embedTitle');
        let thumbnail: string | null = interaction.fields.getTextInputValue('embedMiniImg');
        let desc: string | null = interaction.fields.getTextInputValue('embedDesc');
        let image: string | null = interaction.fields.getTextInputValue('embedImage');
        let footer: string | null = interaction.fields.getTextInputValue('embedFooter');

        title = title.length >= 1 ? title : null
        thumbnail = thumbnail.length >= 1 ? thumbnail : null
        desc = desc.length >= 1 ? desc : null
        image = image.length >= 1 ? image : null

        // Chev if thumbnail, image and color are valid.
        const errorEmbed = new EmbedBuilder()
            .setColor(config.embeds.colors.error as ColorResolvable);
        if (thumbnail && !isValidURL(thumbnail)) {
            errorEmbed
                .setAuthor({ name: 'Invalid Thumbnail URL', iconURL: config.embeds.images.errorImg });
            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
        }
        if (image && !isValidURL(image)) {
            errorEmbed
                .setAuthor({ name: 'Invalid Image URL', iconURL: config.embeds.images.errorImg });
            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true })
        }

        // Build the embed.
        const customEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.guild?.name || "", iconURL: interaction.guild?.iconURL()!})
            .setColor(color as ColorResolvable | null)
            .setThumbnail(thumbnail)
            .setTitle(title)
            .setDescription(desc)
            .setImage(image)
            .setFooter(footer?.length >= 1 ? {text: footer} : null)
        
        if (parseInt(timestamp)) customEmbed.setTimestamp();

        // Determine where to send the embed.
        if (channel) {
            await channel.send({ embeds: [customEmbed] });
        } else {
            await interaction.channel?.send({ embeds: [customEmbed] });
        }

        await interaction.reply({ content: "Embed sent successfully", ephemeral: true });
    }
}