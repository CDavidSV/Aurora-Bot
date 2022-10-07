// Displays the specified role's information.
import config from '../../config.json';
import { Client, Message, EmbedBuilder, AttachmentBuilder, ColorResolvable, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import MCommand from '../../Classes/MCommand';

export default {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription("Displays the specified role's information."),
    aliases: ['role'],
    category: 'Gestión de roles',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
    execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        const roleEmbed = new EmbedBuilder();
        const errorImg = new AttachmentBuilder(config.embeds.images.errorImg);

        // Convert args to lowercase.
        args = args.map(arg => arg.toLowerCase());

        if (args.length < 2) {
            roleEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'Esta acción requiere mencionar o nombrar el rol.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando: \`${prefix}role <@rol/rol>\``)
            message.reply({ embeds: [roleEmbed], files: [errorImg] });
            return;
        }
        if (!message.guild!.members.me!.permissions.has([PermissionsBitField.Flags.ManageRoles])) {
            roleEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tengo permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [roleEmbed], files: [errorImg] });
            return;
        }

        const roleID = args[1].replace(/[<@!&>]/g, '');
        let role = message.guild!.roles.cache.get(roleID);

        if (!role) {
            role = message.guild!.roles.cache.find(role => role.name.toLowerCase().includes(args[1]));
            if (!role) { // Checks if either the role or the user does not exist.
                roleEmbed
                    .setColor(config.embeds.colors.errorColor as ColorResolvable)
                    .setAuthor({ name: 'El rol no existe. Intenta mencionarlos.', iconURL: 'attachment://error-icon.png' })
                message.reply({ embeds: [roleEmbed], files: [errorImg] });
                return;
            }
        }

        // Role info.
        const name = role.name;
        const ID = role.id;
        const createdAt = Math.round(role.createdTimestamp / 1000);
        const memberSize = role.members.size;
        const color = role.color.toString(16);
        const position = role.position;

        let hoist: string;
        let managed: string;
        let mentionable: string;

        role.hoist ? hoist = '✓' : hoist = 'Χ';
        role.managed ? managed = '✓' : managed = 'Χ';
        role.mentionable ? mentionable = '✓' : mentionable = 'Χ';

        roleEmbed
            .setAuthor({ name: `${message.guild!.name}`, iconURL: message.guild?.iconURL({ forceStatic: false })! })
            .setFields(
                { name: 'Nombre', value: `${name}`, inline: true },
                { name: 'ID', value: `${ID}`, inline: true },
                { name: 'Fecha de creación', value: `<t:${createdAt}> (<t:${createdAt}:R>)`, inline: false },
                { name: 'Miembros en caché', value: `${memberSize}`, inline: true },
                { name: 'Posición', value: `${position}`, inline: true },
                { name: 'Color en Hex', value: `#${color.toUpperCase()}`, inline: true },
                { name: 'Separado', value: `${hoist}`, inline: true },
                { name: 'Administrado', value: `${managed}`, inline: true },
                { name: 'Mencionable', value: `${mentionable}`, inline: true },
            )
            .setColor(role!.color);
        message.channel.send({ embeds: [roleEmbed] });
    }
} as MCommand