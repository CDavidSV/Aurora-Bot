import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('⚙️ Change settings in this server')
        .addSubcommandGroup(subCommandGroup => 
            subCommandGroup
                .setName('welcome')
                .setDescription('👋 Change settings for welcome messages')
                .addSubcommand(subCommand =>
                    subCommand
                        .setName('channel')
                        .setDescription('💬 Set a welcome message channel')
                        .addChannelOption(option => 
                            option
                                .setName('channel')
                                .setDescription('Select a channel')
                                .addChannelTypes(ChannelType.GuildText)
                                .setRequired(true)))
                .addSubcommand(subCommand => 
                    subCommand
                        .setName('disable')
                        .setDescription('⛔️ Disable welcome messages'))
                .addSubcommand(subCommand => 
                    subCommand
                        .setName('message')
                        .setDescription('📝 Set a welcome message and image'))
                .addSubcommand(subCommand => 
                    subCommand
                        .setName('embed')
                        .setDescription('📄 Whether or not to use embeds for welcome messages')
                        .addBooleanOption(option =>
                            option
                                .setName('enable')
                                .setDescription('Set to true or false')
                                .setRequired(true))))
        .addSubcommandGroup(subCommandGroup => 
            subCommandGroup
                .setName('leave')
                .setDescription('👋 Change settings for leave messages')
                .addSubcommand(subCommand =>
                    subCommand
                        .setName('channel')
                        .setDescription('💬 Set a leave message channel')
                        .addChannelOption(option => 
                            option
                                .setName('channel')
                                .setDescription('Select a channel')
                                .addChannelTypes(ChannelType.GuildText)
                                .setRequired(true)))
                .addSubcommand(subCommand => 
                    subCommand
                        .setName('disable')
                        .setDescription('⛔️ Disable leave messages'))
                .addSubcommand(subCommand => 
                    subCommand
                        .setName('message')
                        .setDescription('📝 Set a leave message and image'))
                .addSubcommand(subCommand => 
                    subCommand
                        .setName('embed')
                        .setDescription('📄 Whether or not to use embeds for leave messages')
                        .addBooleanOption(option =>
                            option
                                .setName('enable')
                                .setDescription('Set to true or false')
                                .setRequired(true))))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    botPerms: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
}