import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import guildScheema from "../../../scheemas/guildSchema";
import config from "../../../config.json"

export default {
    data: new SlashCommandBuilder()
        .setName('autonick')
        .setDescription('🏷️ Atomatically sets a nickname when a user joins the server')
        .addSubcommand(subCommand => 
            subCommand
                .setName('set')
                .setDescription('🏷️ Add a nickname that will be added to users that join this server')
                .addStringOption(option => 
                    option
                        .setName('nickname')
                        .setDescription('The nickname that will be added to the user that joins')
                        .setMinLength(1)
                        .setMaxLength(32)
                        .setRequired(true)))
        .addSubcommand(subCommand => 
            subCommand
                .setName('disable')
                .setDescription('❌ disable autonick for new users'))
        .addSubcommand(subCommand =>
            subCommand
                .setName('view')
                .setDescription('🏷️ View this server\'s autonick'))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    botPerms: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ChangeNickname, PermissionFlagsBits.ManageNicknames],
    callback: async (interaction: ChatInputCommandInteraction) => {
        const command = interaction.options.getSubcommand(false);

        const autonickEmbed = new EmbedBuilder();

        switch(command) {
            case 'set': {
                const nickname = interaction.options.getString('nickname', true);

                await guildScheema.findByIdAndUpdate(interaction.guildId, { autonick: nickname }, { upsert: true, new: true, setDefaultsOnInsert: true });

                autonickEmbed.setAuthor({ name: `Autonick configured. Users that join will now receive the nickname: ${nickname}`, iconURL: config.embeds.images.successImg }).setColor(config.embeds.colors.success as ColorResolvable);
                await interaction.reply({ embeds: [autonickEmbed], ephemeral: true });
                break;
            }
            case 'disable': {
                await guildScheema.findByIdAndUpdate(interaction.guildId, { autonick: null }, { upsert: true, new: true, setDefaultsOnInsert: true });

                autonickEmbed.setAuthor({ name: 'Autonick has been disabled on this server', iconURL: config.embeds.images.successImg }).setColor(config.embeds.colors.success as ColorResolvable);
                await interaction.reply({ embeds: [autonickEmbed], ephemeral: true });
                
                break;
            }
            case 'view': {
                const guildSettings = await guildScheema.findById(interaction.guildId);

                autonickEmbed.setAuthor({ name: 'This server is not configured with autonick', iconURL: config.embeds.images.errorImg }).setColor(config.embeds.colors.error as ColorResolvable);
                if (!guildSettings || !guildSettings.autonick) {
                    await interaction.reply({ embeds: [autonickEmbed], ephemeral: true });
                    break;
                }

                autonickEmbed.setAuthor({ name: `The autonick for this server is: ${guildSettings.autonick}` }).setColor(config.embeds.colors.main as ColorResolvable);
                await interaction.reply({ embeds: [autonickEmbed], ephemeral: true });

                break;
            }
        }
    }
}