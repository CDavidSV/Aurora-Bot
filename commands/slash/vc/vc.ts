import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('vc')
        .setDescription('⚙️ Change settings for you temporary voice channel')
        .addSubcommand(subcommand => 
            subcommand
                .setName('limit')
                .setDescription('🛑 Set a limit for how many people can join your vc')
                .addIntegerOption(option => 
                    option
                        .setName('max')
                        .setMinValue(0)
                        .setMaxValue(99)
                        .setRequired(true)
                        .setDescription('Set a user limit for your vc')))
        .addSubcommand(subcommand => 
            subcommand
                .setName('name')
                .setDescription('🏷️ Set a name for your vc')
                .addStringOption(option =>
                    option
                        .setName('custom_name')
                        .setRequired(true)
                        .setDescription('Type in a custom vc name.')
                        .setMinLength(1)
                        .setMaxLength(100)))
        .addSubcommand(subcommand => 
            subcommand
                .setName('hide')
                .setDescription('🔐 Hide your vc'))
        .addSubcommand(subcommand => 
            subcommand
                .setName('unhide')
                .setDescription('🔐 Unhide your vc'))
        .setDMPermission(false),
    botPerms: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers],
    requestsBeforeCooldown: 5,
    cooldown: 60,
}