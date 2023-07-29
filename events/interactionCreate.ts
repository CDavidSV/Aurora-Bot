import { Client, ColorResolvable, EmbedBuilder, Events, Interaction, InteractionType } from "discord.js";
import config from "../config.json";

/**
 * 
 * @param options 
 * @param commandName 
 * @param client 
 * @returns subCommand file object
 */
const fetchSubCommandFile = (options: any, commandName: string, client: Client) => {
    const subCommand = options.getSubcommand(false);
    const subCommandGroup = options.getSubcommandGroup();
    const subCommandName = subCommandGroup ? `${subCommandGroup}.${subCommand}` : subCommand;
    const subCommandFile = client.subCommands.get(`${commandName}.${subCommandName}`);

    return subCommandFile;
}

export default {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: Interaction) {
        switch(interaction.type) {
            case InteractionType.ApplicationCommand: {
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
    
                const subCommandFile = fetchSubCommandFile(options, commandName, client);
    
                if (!subCommandFile && !command.callback) {
                    await interaction.reply({
                        content: "This command is outdated.",
                        ephemeral: true
                    });
                    return;
                }
                
                try {
                    await (subCommandFile?.callback ?? command.callback)(interaction);
                } catch (err) {
                    console.error(err);
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true }).catch((err) => console.error(err));
                    } else {
                        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }).catch((err) => console.error(err));
                    }
                }
                break;
            }
            case InteractionType.ApplicationCommandAutocomplete: {
                const { commandName, client, options } = interaction;
                const command = client.slashCommands.get(commandName)!;
    
                const subCommandFile = fetchSubCommandFile(options, commandName, client);
    
                try {
                    await (subCommandFile?.autoComplete ?? command.autoComplete)(interaction);
                } catch (err) {
                    console.error('Unhandled Error: ', err);
                }
                break;
            }
            case InteractionType.MessageComponent: {
                const { customId } = interaction
                const componentName = customId.split('.')[0];

                const componentFile = interaction.client.messageComponents.get(componentName);

                if (!componentFile) return;

                try {
                    await componentFile.callback(interaction);
                } catch (err) {
                    interaction.update({ components: [] }).catch(console.error);
                    console.error('Unhandled Error: ', err);
                }
            }
        }
    }
};