// Bans a guild member.
import config from '../../config.json';
import { Client, Message, Permissions, MessageEmbed, MessageAttachment, ColorResolvable } from 'discord.js';

export default {
    aliases: ['ban'],
    execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        // error and success images.
        const errorImg = new MessageAttachment(config.embeds.errorImg);
        // Get guild 
        const { guild } = message;
        // Create message embed.
        const banEmbed = new MessageEmbed();
        // Ban reason.
        let banReason = 'No especificada';

        // Validate that the user requesting the action has enough Permissions.
        if (!message.member!.permissions.has([Permissions.FLAGS.BAN_MEMBERS])) {
            banEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tienes permiso para usar este comando.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [banEmbed], files: [errorImg] });
            return;
        }

        // In case the no member is mentioned.
        if (args.length < 2) {
            banEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'Debes de mencionar al miembro.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando: \`${prefix}ban <@miembro> (razón opcional)\``)
            message.reply({ embeds: [banEmbed], files: [errorImg] });
            return;
        }

        // No reason specified.
        if (args.length > 2) {
            banReason = String(args.slice(2)).replace(/,/g, ' ');
        }

        // Get member object.
        const userID = args[1].replace(/[<@!&>]/g, '');
        const member = guild!.members.cache.get(userID);

        // member does not exist
        if (!member) {
            banEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'Ese miembro no existe.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [banEmbed], files: [errorImg] });
            return;
        }

        // Avoids user from banning moderators and administrators.
        if ((member!.permissions.has([Permissions.FLAGS.ADMINISTRATOR]) || !member!.bannable) && message.member!.id !== guild!.ownerId) {
            banEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'No puedes banear a un administrador.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [banEmbed], files: [errorImg] });
            return;
        }

        if (!guild!.me!.permissions.has([Permissions.FLAGS.KICK_MEMBERS])) {
            banEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tengo permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [banEmbed], files: [errorImg] });
            return;
        }

        message.delete();
        // Attempts to ban the mentioned user.
        member!.ban({ reason: banReason }).then(() => {
            banEmbed
                .setColor(config.embeds.defaultColor as ColorResolvable)
                .setAuthor({ name: `${member!.user.tag} fue banead@ del servidor.`, iconURL: String(member!.user.avatarURL()) })
                .setDescription(`****Razón:**** ${banReason}`)
            message.channel.send({ embeds: [banEmbed] });
        }).catch(() => {
            banEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'No puedo hacer eso porque mi rol más alto está demasiado bajo en la jerarquía.', iconURL: 'attachment://error-icon.png' })
            message.channel.send({ embeds: [banEmbed], files: [errorImg] });
        });
    }
}