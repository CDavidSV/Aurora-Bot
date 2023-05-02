import { AttachmentBuilder, ColorResolvable, EmbedBuilder, Events, Interaction } from "discord.js";
import config from "../config.json";

// Error image.
const file = new AttachmentBuilder(config.embeds.images.errorImg);

export default {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName)!;
        if (command.botPerms && !interaction.guild!.members.me!.permissions.has(command!.botPerms)) {
            const noPermissions = new EmbedBuilder()
            .setColor(config.embeds.colors.error as ColorResolvable)
            .setAuthor({ name: 'No tengo suficiente permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
            interaction.reply({ embeds: [noPermissions], files: [file], ephemeral: true });
            return;
        }

        command.callback(interaction);
    }
};