import { ColorResolvable, CommandInteractionOptionResolver, EmbedBuilder, Events, Interaction } from "discord.js";
import config from "../config.json";

export default {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction) {
        if (interaction.isModalSubmit()) {
            return;
        } else if (interaction.isChatInputCommand()) {
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

            const subCommand = options.getSubcommand(false);
            const subCommandGroup = options.getSubcommandGroup();
            const subCommandName = subCommandGroup ? `${subCommandGroup}.${subCommand}` : subCommand;
            const subCommandFile = client.subCommands.get(`${commandName}.${subCommandName}`);

            if (!subCommandFile && !command.callback) {
                await interaction.reply({
                    content: "This command is outdated.",
                    ephemeral: true
                });
                return;
            }
            
            try {
                await (subCommandFile?.callback ?? command.callback)(interaction);
            } catch {
                interaction.reply({ content: "An unexpected error occurred while running this command. Please try again later.", ephemeral: true });
            }
        } else if (interaction.isAutocomplete()) {
            return;
        }
    }
};