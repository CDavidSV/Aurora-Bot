import { ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, ColorResolvable, ActionRowBuilder, ModalActionRowComponentBuilder } from "discord.js";
import config from "../../../config.json"
import { isValidColorHex } from "../../../util/herper-functions";

export default {
    subCommand: 'embed.create',
    callback: async (interaction: ChatInputCommandInteraction) => {
        const color = interaction.options.getString('color', false);
        const channel = interaction.options.getChannel('channel', false);
        const timestamp = interaction.options.getBoolean('timestamp', false) || false;

        const modal = new ModalBuilder()
            .setCustomId(`customEmbedModal.${channel ? channel!.id : ""}.${color ? color : ""}.${timestamp ? 1 : 0}`)
            .setTitle('Your Message');

        const embedTitle = new TextInputBuilder()
            .setCustomId('embedTitle')
            .setLabel('title')
            .setMinLength(1)
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        
        const thumbnailURL = new TextInputBuilder()
            .setCustomId('embedMiniImg')
            .setLabel('thumbnail url')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)

        const description = new TextInputBuilder()
            .setCustomId('embedDesc')
            .setLabel('description')
            .setMinLength(1)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)

        const imageURL = new TextInputBuilder()
            .setCustomId('embedImage')
            .setLabel('image url')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)

        const footer = new TextInputBuilder()
            .setCustomId('embedFooter')
            .setLabel('footer')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)

        if (color && !isValidColorHex(color)) {
            const errorEmbed = new EmbedBuilder()
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: 'Invalid Color hexadecimal', iconURL: config.embeds.images.errorImg });
            return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
        modal.addComponents(
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(embedTitle),
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(thumbnailURL),
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(description),
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(imageURL),
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(footer),
        );

        await interaction.showModal(modal);
    }
}