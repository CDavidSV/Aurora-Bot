// Show a user´s avatar.
import {SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('👤 Shows user related information')
        .addSubcommand(subcommand =>
            subcommand
                .setName('avatar')
                .setDescription("👤 Shows a user's avatar")
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User Mention')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('banner')
                .setDescription("👤 Shows a user's banner")
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User Mention')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription("👤 Shows a user's information")
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User Mention')
                        .setRequired(false)))
        .setDMPermission(false),
    botPerms: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
}