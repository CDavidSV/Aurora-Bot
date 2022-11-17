// Displays all roles for the specified user or all roles in a server.
import config from '../../config.json';
import { Client, Message, EmbedBuilder, AttachmentBuilder, ColorResolvable, PermissionsBitField, SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from 'discord.js';
import MCommand from '../../Classes/MCommand';
import role from './role';

const rolesEmbed = new EmbedBuilder();

export default {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Displays all roles for the specified user or all roles in a server.')
        .setDMPermission(false),
    aliases: ['roles'],
    category: 'Gestión de roles',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageRoles],
    userPerms: [],
    cooldown: 0,
    commandType: 'Slash&Prefix',

    execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        // Convert args to lowercase.
        args = args.map(arg => arg.toLowerCase());

        // Variables.
        const { guild } = message;

        // Evaluate initial conditions.
        if (args.length <= 1) {
            const roles = message.guild!.roles.cache.map(role => { return role.id });
            let displayedRoles = '';

            for (let role = 0; role < roles.length; role++) {
                displayedRoles += `${role + 1}. <@&${roles[role]}>\n`;
            }

            rolesEmbed
                .setColor(config.embeds.colors.defaultColor as ColorResolvable)
                .setTitle(`Roles en ${message.guild!.name} [${roles.length}]`)
                .setDescription(displayedRoles)
                .setThumbnail(message.guild!.iconURL({ forceStatic: false })!)
            message.channel.send({ embeds: [rolesEmbed] });
            return;
        }

        // Get user ID from tag
        const userID = args[1].replace(/[<@!&>]/g, '');
        let member = guild!.members.cache.get(userID);

        const memberRoles = member!.roles.cache.map(role => { return role.id });
        let displayedRoles = '';

        for (let role = 0; role < memberRoles.length; role++) {
            displayedRoles += `${role + 1}. <@&${memberRoles[role]}>\n`;
        }

        rolesEmbed
            .setColor(config.embeds.colors.defaultColor as ColorResolvable)
            .setAuthor({ name: `${message.guild!.name}`, iconURL: message.guild!.iconURL()! })
            .setTitle(`Roles de ${member!.user.tag} [${memberRoles.length}]`)
            .setDescription(displayedRoles)
            .setThumbnail(member!.displayAvatarURL({ forceStatic: false }))
        message.channel.send({ embeds: [rolesEmbed] });
    },

    executeSlash(interaction: ChatInputCommandInteraction<CacheType>) {
        const roles = interaction.guild!.roles.cache.map(role => { return role.id });
        let displayedRoles = '';

        for (let role = 0; role < roles.length; role++) {
            displayedRoles += `${role + 1}. <@&${roles[role]}>\n`;
        }

        rolesEmbed
            .setColor(config.embeds.colors.defaultColor as ColorResolvable)
            .setTitle(`Roles en ${interaction.guild!.name} [${roles.length}]`)
            .setDescription(displayedRoles)
            .setThumbnail(interaction.guild!.iconURL({ forceStatic: false })!)
        interaction.reply({ embeds: [rolesEmbed] });
    }
} as MCommand