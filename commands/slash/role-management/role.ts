import { PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Role management commands')
        .addSubcommand(subcommand => 
            subcommand
                .setName('grant')
                .setDescription('Grants a role to the specified member')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User Mention')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role Mention')
                        .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand
                .setName('revoke')
                .setDescription('Revokes a role from the specified member')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User Mention')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('Role Mention')
                        .setRequired(true)))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageRoles]
}