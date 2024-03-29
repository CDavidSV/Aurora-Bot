import { ActionRowBuilder, ChatInputCommandInteraction, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import guildSchema from "../../../schemas/guildSchema";

export default {
    subCommand: "settings.leave.message",
    callback: async (interaction: ChatInputCommandInteraction) => {
        const modalId = 'goodbyeMessageModal';

        const modal = new ModalBuilder()
            .setCustomId(modalId)
            .setTitle('Configure leave message/image');
        
        const leaveMessageInput = new TextInputBuilder()
            .setCustomId('messageInput')
            .setLabel('leave text')
            .setPlaceholder('Message that will be sent once the user joins the server')
            .setMaxLength(2000)
            .setRequired(false)
            .setStyle(TextInputStyle.Paragraph)

        const imageInput = new TextInputBuilder()
            .setCustomId('imageInput')
            .setLabel('leave image')
            .setPlaceholder('url for the leave image')
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        
        const syntax = new TextInputBuilder()
            .setCustomId('syntax')
            .setLabel('syntaxes')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setValue(`{username} - User's name\n{mention} - User's mention\n{id} - User's ID\n{server} - Server name\n{members} - Server member count\n`)

        const guildSettings = await guildSchema.findById(interaction.guild?.id).catch(() => null);

        if (guildSettings && guildSettings.goodbye?.goodbye_message) {
            leaveMessageInput.setValue(guildSettings.goodbye.goodbye_message);
        }
        if (guildSettings && guildSettings.goodbye?.goodbye_image) {
            imageInput.setValue(guildSettings.goodbye.goodbye_image);
        }

        const firstRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(leaveMessageInput);
        const secondRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(imageInput);
        const thirdRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(syntax)
        modal.addComponents(firstRow, secondRow, thirdRow);

        await interaction.showModal(modal);
    }
}