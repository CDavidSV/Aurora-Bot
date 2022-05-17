// Bans a guild member.

import { Client, Message, Permissions, MessageEmbed, MessageAttachment} from 'discord.js';

export default {
    execute(client: Client, message: Message, prefix: string, ...args: string[]){

        // error and success images.
        const errorImg = new MessageAttachment('./assets/command-images/error-icon.png');
        // Get guild 
        const { guild } = message;
        // Create message embed.
        const banEmbed = new MessageEmbed();
        // Ban reason.
        let banReason = 'No especificada';

        // Validate that the user requesting the action has enough Permissions.
        if (!message.member!.permissions.has([Permissions.FLAGS.BAN_MEMBERS, Permissions.FLAGS.KICK_MEMBERS])) {
            banEmbed
                .setColor('#c9040e')
                .setAuthor({ name: 'No tienes permiso para usar este comando.', iconURL: 'attachment://error-icon.png' })
            message.reply({embeds: [banEmbed], files: [errorImg]});
            return;
        }

        // In case the no member is mentioned.
        if (args.length < 2) {
            banEmbed
                .setColor('#c9040e')
                .setAuthor({ name: 'Debes de mencionar al miembro.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando \`${prefix}ban <@miembro> (razón opcional)\``)
            message.reply({embeds: [banEmbed], files: [errorImg]});
            return;
        }

        // No reason specified.
        if (args.length > 2) {
            banReason = String(args.slice(2)).replace(/,/g,' ');
        }

        // Get member object.
        const userID = args[1].replace(/[<@!&>]/g,'');
        const member = guild!.members.cache.get(userID);
        
        // member does not exist
        if (!member) {
            banEmbed
                .setColor('#c9040e')
                .setAuthor({ name: 'Ese miembro no existe.', iconURL: 'attachment://error-icon.png' })
            message.reply({embeds: [banEmbed], files: [errorImg]});
            return;
        }

        // Avoids user from banning moderators and administrators.
        if ((member!.permissions.has([Permissions.FLAGS.ADMINISTRATOR]) || !member!.bannable) && message.member!.id !== guild!.ownerId) {
            banEmbed
                .setColor('#c9040e')
                .setAuthor({ name: 'No puedes banear a un administrador.', iconURL: 'attachment://error-icon.png' })
            message.reply({embeds: [banEmbed], files: [errorImg]});
            return;
        }

        // Attempts to ban the mentioned user.
        member!.ban({reason: banReason}).then(() => {
            banEmbed
                .setColor('#393C3A')
                .setAuthor({ name: `${member!.user.tag} fue banead@ del servidor.`, iconURL: String(member!.user.avatarURL()) })
                .setDescription(`****Razón:**** ${banReason}`)
            message.reply({embeds: [banEmbed]});
        }).catch(() => {
            banEmbed
                .setColor('#c9040e')
                .setAuthor({ name: 'No puedo hacer eso porque mi rol más alto está demasiado bajo en la jerarquía.', iconURL: 'attachment://error-icon.png' })
            message.reply({embeds: [banEmbed], files: [errorImg]});
        });

    }
}