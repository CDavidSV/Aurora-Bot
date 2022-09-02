// Displays a roles information.
import config from '../../config.json';
import { Client, Message, EmbedBuilder, AttachmentBuilder, ColorResolvable, PermissionsBitField } from 'discord.js';

export default {
    aliases: ['role'],
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

        roleEmbed
            .setAuthor({ name: `${message.guild!.name}`, iconURL: message.guild?.iconURL({ forceStatic: false })! })
            .setFields(
                { name: 'Nombre', value: `${role!.name}`, inline: true },
                { name: 'Miembros', value: `${role!.members.size}`, inline: true },
                { name: 'ID', value: `${role!.id}`, inline: false },
                // { name: 'Fecha de creación', value: `${}`, inline: false },
            )
            .setColor(role!.color);
        console.log(role);
        message.channel.send({ embeds: [roleEmbed] });
    }
}