import { ChannelType, PermissionFlagsBits, SlashCommandBuilder, } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('📝 Create a custom embed')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('📝 Create a custom embed')
                .addStringOption(option =>
                    option
                        .setName('color')
                        .setDescription('Color of the embed in hexadecimal e.g. #b917ff')
                        .setRequired(false))
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel to send the embed to')
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.GuildForum, ChannelType.GuildStageVoice, ChannelType.PrivateThread, ChannelType.GuildVoice)
                        .setRequired(false))
                .addBooleanOption(option =>
                    option
                        .setName('timestamp')
                        .setDescription('Add a timestamp to the embed (Default is false)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('image')
                .setDescription('🖼️ Send an image through an embed')
                .addAttachmentOption(option =>
                    option
                        .setName('image')
                        .setDescription('Image to send')
                        .setRequired(true))
                    .addStringOption(option =>
                        option
                            .setName('color')
                            .setDescription('Color of the embed in hexadecimal e.g. #b917ff')
                            .setRequired(false))
                    .addChannelOption(option =>
                        option
                            .setName('channel')
                            .setDescription('Channel to send the embed to')
                            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.GuildForum, ChannelType.GuildStageVoice, ChannelType.PrivateThread, ChannelType.GuildVoice)
                            .setRequired(false)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    botPerms: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks]
}