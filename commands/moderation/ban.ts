// Bans a guild member.
import config from '../../config.json';
import { Client, Message, EmbedBuilder, AttachmentBuilder, ColorResolvable, PermissionsBitField, User } from 'discord.js';

export default {
    aliases: ['ban'],
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        // Convert args to lowercase.
        args = args.map(arg => arg.toLowerCase());
        // error and success images.
        const errorImg = new AttachmentBuilder(config.embeds.images.errorImg);
        // Get guild 
        const { guild } = message;
        // Create message embed.
        const banEmbed = new EmbedBuilder();
        // Ban reason.
        let banReason = 'No especificada';

        // Validate that the user requesting the action has enough Permissions.
        if (!message.member!.permissions.has([PermissionsBitField.Flags.BanMembers])) {
            banEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tienes permiso para usar este comando.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [banEmbed], files: [errorImg] });
            return;
        }

        // In case the no member is mentioned.
        if (args.length < 2) {
            banEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'Debes de mencionar al miembro.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando: \`${prefix}ban <@miembro> (razón opcional)\``)
            message.reply({ embeds: [banEmbed], files: [errorImg] });
            return;
        }

        if (!guild!.members.me!.permissions.has([PermissionsBitField.Flags.KickMembers])) {
            banEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tengo permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
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
        let user: User;

        // member does not exist.
        if (!member) {
            try {
                user = await client.users.fetch(userID);
            } catch {
                banEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'Ese usuario no existe.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [banEmbed], files: [errorImg] });
            return;
            }
        } else {
            // Avoids user from banning moderators and administrators.
            user = member!.user;
            if ((member!.permissions.has([PermissionsBitField.Flags.Administrator]) || !member!.bannable) && message.member!.id !== guild!.ownerId) {
                banEmbed
                    .setColor(config.embeds.colors.errorColor as ColorResolvable)
                    .setAuthor({ name: 'No puedes banear a un administrador.', iconURL: 'attachment://error-icon.png' })
                message.reply({ embeds: [banEmbed], files: [errorImg] });
                return;
            }
        }

        message.delete();

        // Attempts to ban the mentioned member.
        message.guild!.members.ban(user, {reason: banReason}).then(() => {
            banEmbed
                .setColor(config.embeds.colors.defaultColor as ColorResolvable)
                .setAuthor({ name: `${user.tag} fue banead@ del servidor.`, iconURL: String(user.avatarURL({forceStatic: false})) })
                .setDescription(`****Razón:**** ${banReason}`)
            message.channel.send({ embeds: [banEmbed] });
        }).catch(() => {
            banEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No puedo hacer eso porque mi rol más alto está demasiado bajo en la jerarquía.', iconURL: 'attachment://error-icon.png' })
            message.channel.send({ embeds: [banEmbed], files: [errorImg] });
        });
    }
}