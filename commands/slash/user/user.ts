// Show a user´s avatar.
import {SlashCommandBuilder, PermissionsBitField } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('🎮 Play a variety of games')
        .addSubcommand(subcommand =>
            subcommand
                .setName('avatar')
                .setDescription("Shows a user's avatar")
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User Mention')
                        .setRequired(false))),
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
}