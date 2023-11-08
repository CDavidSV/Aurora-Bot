import { Client, ColorResolvable, EmbedBuilder, Events, Interaction, InteractionType, Collection } from "discord.js";
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
                const { cooldowns } = interaction.client;
                const { commandName, client, options } = interaction;
                const command = client.slashCommands.get(commandName)!;
                const errorEmbed = new EmbedBuilder()
                
                // Check if the bot has sufficient permissions to perform the command.
                if (command.botPerms && interaction.guild && !interaction.guild!.members.me!.permissions.has(command!.botPerms)) {
                    errorEmbed
                        .setColor(config.embeds.colors.error as ColorResolvable)
                        .setAuthor({ name: "I don't have enough permissions to perform this action.", iconURL: config.embeds.images.errorImg })
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    
                }
    
                const subCommandFile = fetchSubCommandFile(options, commandName, client);
    
                if (!subCommandFile && !command.callback) {
                    return interaction.reply({
                        content: "This command is outdated.",
                        ephemeral: true
                    }).catch(console.error);
                }

                // Handle cooldowns.
                if (!cooldowns.has(command.data.name)) {
                    cooldowns.set(command.data.name, new Collection());
                }

                const currentTime = Date.now();
                const timestamps = cooldowns.get(command.data.name)!;
                const cooldownMs = (command.cooldown ?? 0) * 1000;

                // Check if the user already executed this command before.
                if (timestamps && timestamps.has(interaction.user.id)) {
                    const expirationTime = timestamps.get(interaction.user.id)! + cooldownMs;

                    if (expirationTime > currentTime) {
                        return interaction.reply({ content: `Please wait, this command is on cooldown. You may use it again <t:${Math.round(expirationTime / 1000)}:R>.`, ephemeral: true }).catch(console.error);
                    } 
                }

                // Set the cooldown for the user.
                timestamps.set(interaction.user.id, currentTime);
                setTimeout(() => timestamps.delete(interaction.user.id), cooldownMs);
                
                try {
                    await (subCommandFile?.callback ?? command.callback)(interaction);
                } catch (err) {
                    console.error(err);
                    errorEmbed
                        .setAuthor({ name: 'There was an error while executing this command! Please try again', iconURL: config.embeds.images.errorImg })
                        .setColor(config.embeds.colors.error as ColorResolvable)

                    if (interaction.replied) {
                        interaction.editReply({ embeds: [errorEmbed] }).catch(console.error);
                    } else if (interaction.deferred) {
                        interaction.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(console.error);
                    } else {
                        interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(console.error);
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
                    console.error('Unhandled Command Error: ', err);
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
                    console.error('Unhandled Component Error: ', err);
                }
                break;
            }
            case InteractionType.ModalSubmit: {
                const { customId } = interaction
                const modalName = customId.split('.')[0];

                const modalFile = interaction.client.modals.get(modalName);

                if (!modalFile) return;

                try {
                    await modalFile.callback(interaction);
                } catch (err) {
                    const errorEmbed = new EmbedBuilder()
                        .setAuthor({ name: 'Unable to process modal', iconURL: config.embeds.images.errorImg })
                        .setColor(config.embeds.colors.error as ColorResolvable)
                    interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(console.error);
                    console.error('Unhandled Modal Error: ', err);
                }
                break;
            }
        }
    }
};