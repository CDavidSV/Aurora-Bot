import { AttachmentBuilder, ColorResolvable, EmbedBuilder } from "discord.js";
import config from "../config.json";
import { client } from "..";

// Error image.
const file = new AttachmentBuilder(config.embeds.images.errorImg);

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    if (!interaction.guild!.members.me!.permissions.has(command!.botPerms)) {
        const noPermissions = new EmbedBuilder()
            .setColor(config.embeds.colors.errorColor as ColorResolvable)
            .setAuthor({ name: 'No tengo suficiente permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
        interaction.reply({ embeds: [noPermissions], files: [file], ephemeral: true });
        return;
    }

    try {
        const noPermissions = new EmbedBuilder()
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setAuthor({ name: 'Slash Commands en desarrollo.', iconURL: 'attachment://error-icon.png' })
        interaction.reply({ embeds: [noPermissions], ephemeral: true });
    } catch (error) {
        console.error(error);

        const unexpectedError = new EmbedBuilder()
            .setColor(config.embeds.colors.errorColor as ColorResolvable)
            .setAuthor({ name: 'Error Inesperado.', iconURL: 'attachment://error-icon.png' })
        await interaction.reply({ embeds: [unexpectedError], files: [file], ephemeral: true });
    }
}); 