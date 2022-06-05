// Deletes specified ammount of messages in a channel.
import config from '../../config.json';
import { Client, Message, Permissions, MessageEmbed, MessageAttachment, ColorResolvable } from 'discord.js';

export default {
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        const clearEmbed = new MessageEmbed();
        const errorImg = new MessageAttachment(config.embeds.errorImg);
        const successImg = new MessageAttachment(config.embeds.successImg);

        // Evaluate initial conditions (checks if the user has enogh permissions and that he has entered the correct commands or arguments)
        if (!message.member!.permissions.has([Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_MESSAGES])) {
            clearEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tienes permiso para usar este comando.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [clearEmbed], files: [errorImg] });
            return;
        }
        if (message.channel.type !== "GUILD_TEXT") {
            clearEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'No puedes eliminar mensajes en canales que no sean de texto.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando: \`${prefix}clearchat <miembro(opcional)> <cantidad> \``)
            message.reply({ embeds: [clearEmbed], files: [errorImg] });
            return;
        }

        // Store requested message purge limit.
        let totalLimit = Number(args[1]) || Number(args[2]);
        // member object.
        let member: any;

        // Verify that a quantity is specified.
        if (isNaN(totalLimit)) {
            clearEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'Necesitas especificar la cantidad de mensajes.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando: \`${prefix}clearchat <miembro(opcional)> <cantidad> \``)
            message.reply({ embeds: [clearEmbed], files: [errorImg] });
            return;
        }
        if (args.length > 2) {
            member = message.guild!.members.cache.get(args[1].replace(/[<@!&>]/g, '')) || message.guild!.members.cache.get(args[2].replace(/[<@!&>]/g, ''));
            if (member === undefined) {
                clearEmbed
                    .setColor(config.embeds.errorColor as ColorResolvable)
                    .setAuthor({ name: 'El rol o usuario no existe. Intenta mencionarlos.', iconURL: 'attachment://error-icon.png' })
                    .setDescription(`Intenta ingresando: \`${prefix}clearchat <miembro(opcional)> <cantidad> \``)
                message.reply({ embeds: [clearEmbed], files: [errorImg] });
                return;
            }
        }

        await message.delete();
        let fetched;
        let filtered;
        let limit;
        let counter = 0;
        do {
            totalLimit > 100 ? limit = 100 : limit = totalLimit;
            fetched = await message.channel.messages.fetch({ limit: limit });
            if (member !== undefined) {
                filtered = fetched.filter(msg => Date.now() - msg.createdTimestamp < 1209600000 && msg.member! === member);
            } else {
                filtered = fetched.filter(msg => Date.now() - msg.createdTimestamp < 1209600000);
            }
            counter += filtered.size;
            await message.channel.bulkDelete(filtered);
            if (totalLimit >= filtered.size) break;
            totalLimit -= limit;
        } while (totalLimit > 0)

        let msg = 'mensaje';
        if (filtered.size > 1 || filtered.size === 0) {
            msg = 'mensajes';
        }
        if (fetched.some((msg: { createdTimestamp: number; }) => Date.now() - msg.createdTimestamp > 1209600000)) {
            clearEmbed
                .setColor(config.embeds.successColor as ColorResolvable)
                .setAuthor({ name: `He borrado ${counter} ${msg}. \n`, iconURL: 'attachment://success-icon.png' })
                .setDescription('Debido a las limitaciones de Discord, no puedo eliminar mensajes que tengan más de 14 días.')
            message.channel.send({ embeds: [clearEmbed], files: [successImg] }).then(msg => setTimeout(() => msg.delete(), 5000)).catch();
            return;
        }
        clearEmbed
            .setColor(config.embeds.successColor as ColorResolvable)
            .setAuthor({ name: `He borrado ${counter} ${msg}. \n`, iconURL: 'attachment://success-icon.png' })
        message.channel.send({ embeds: [clearEmbed], files: [successImg] }).then(msg => setTimeout(() => msg.delete(), 5000)).catch();
    }
}