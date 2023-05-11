import { AttachmentBuilder, ColorResolvable, EmbedBuilder, Events, Interaction, TextBasedChannel } from "discord.js";
import config from "../config.json";

// Error image.
const file = new AttachmentBuilder(config.embeds.images.errorImg);

export default {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction) {
        if (interaction.isModalSubmit()) {
            return;
        }

        if (interaction.isChatInputCommand()) {
            const { commandName, client, options } = interaction;
            const command = client.slashCommands.get(commandName)!;
    
            // Check if the bot has sufficient permissions to perform the command.
            if (command.botPerms && !interaction.guild!.members.me!.permissions.has(command!.botPerms)) {
                const noPermissions = new EmbedBuilder()
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: 'No tengo suficiente permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
                interaction.reply({ embeds: [noPermissions], files: [file], ephemeral: true });
                return;
            }
    
            // Check if it's a sub command.
            try {
                const subCommand = options.getSubcommand(); // Get corresponding sub command and file.
                const subCommandGroup = options.getSubcommandGroup();
                const subCommandName = subCommandGroup ? `${subCommandGroup}.${subCommand}` : subCommand;
    
                const subCommandFile = client.subCommands.get(`${commandName}.${subCommandName}`);
                if (!subCommandFile && !command.callback) return interaction.reply({ // If no such sub command exits then it is outdated (check for outdated commands).
                    content: "This sub command is outdated.",
                    ephemeral: true
                });
                subCommandFile.callback(interaction);
                return;
            } catch {
                command.callback(interaction);
            }
            return;
        };
    }
};