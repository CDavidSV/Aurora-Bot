import { ColorResolvable, EmbedBuilder, Events, Interaction } from "discord.js";
import config from "../config.json";

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
            if (command.botPerms && interaction.guild && !interaction.guild!.members.me!.permissions.has(command!.botPerms)) {
                const noPermissions = new EmbedBuilder()
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: "I don't have enough permissions to perform this action.", iconURL: config.embeds.images.errorImg })
                interaction.reply({ embeds: [noPermissions], ephemeral: true });
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