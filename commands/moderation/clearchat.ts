// Deletes specified ammount of messages in a channel.
import config from '../../config.json';
import { Client, Message, Permissions, MessageEmbed, MessageAttachment, ColorResolvable } from 'discord.js';

export default {
    aliases: ['clearchat'],
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
        let totalLimit = (Number(args[1]) || Number(args[2])) + 1;
        // member.
        let member: any;

        // Verify that a quantity is specified.
        if (isNaN(totalLimit) || totalLimit < 1 || totalLimit > 1001) {
            clearEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'Necesitas especificar la cantidad de mensajes entre 1 y 1000', iconURL: 'attachment://error-icon.png' })
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
        if (!message.guild!.me!.permissions.has([Permissions.FLAGS.MANAGE_MESSAGES])) {
            clearEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tengo permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [clearEmbed], files: [errorImg] });
            return;
        }

        let fetched;
        let limit;
        let counter: any = [];
        let filteredArray;
        let newArr;
        do {
            // Check if the limit given by the user exceeds 100.
            totalLimit > 100 ? limit = 100 : limit = totalLimit;

            // Fetch messages.
            fetched = await message.channel.messages.fetch({ limit: limit });

            // Check if there is a member.
            if (member !== undefined) {
                fetched = fetched.filter(msg => msg.member! === member);
            }

            // Attempt to bulk delete all fetched messages
            try {
                await message.channel.bulkDelete(fetched, true);
            } catch (error) {
                continue;
            }

            // Count messages.
            filteredArray = fetched.map(msg => msg.id);
            newArr = counter.concat(filteredArray);
            newArr = [...new Set([...counter, ...filteredArray])];
            counter = newArr;

            if (fetched.size < 100) break;
            totalLimit -= limit;
        } while (totalLimit > 0)

        let msg = "mensaje";
        let deleted = counter.length - 1;
        if (deleted > 1 || deleted < 1) {
            msg = "mensajes";
        }

        if (fetched.some((msg: { createdTimestamp: number; }) => Date.now() - msg.createdTimestamp > 1209600000)) {
            message.channel.send(`He borrado \`${deleted} ${msg}\`\nDebido a las limitaciones de Discord, no puedo eliminar mensajes que tengan más de 14 días.`).then(msg => setTimeout(() => msg.delete().catch(error => { }), 6000));
        }
        message.channel.send(`He borrado \`${deleted} ${msg}\``).then(msg => setTimeout(() => msg.delete().catch(error => { }), 6000));
    }
}