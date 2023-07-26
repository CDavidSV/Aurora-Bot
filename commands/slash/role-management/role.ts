import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Role management commands')
        .addSubcommand(subcommand => 
            subcommand
                .setName('grant')
                .setDescription('✔️ Grants a role to the specified member')
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
                .setDescription('❌ Revokes a role from the specified member')
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
                .setName('list')
                .setDescription('📋 Lists the roles of this server or a particular user')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('View a users roles')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('📄 Displays information for a selected role')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Select a role')
                        .setRequired(true)))
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    botPerms: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageRoles]
}