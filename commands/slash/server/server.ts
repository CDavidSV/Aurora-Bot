import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('⚙️ View server information')
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('📰 View server information')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('icon')
                .setDescription('🖼️ View server icon')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('banner')
                .setDescription('🖼️ View server banner')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('settings')
                .setDescription('⚙️ View bot settings for this server')
        ),
    botPerms: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageGuild],
    cooldown: 5
}