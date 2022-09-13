// Deletes specified ammount of messages in a channel.
import config from '../../config.json';
import { Client, Message, Permissions, EmbedBuilder, AttachmentBuilder, ColorResolvable, PermissionsBitField, TextChannel, ChannelType } from 'discord.js';

export default {
    aliases: ['clearchat', 'clear', 'purge'],
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        // Convert args to lowercase.
        args = args.map(arg => arg.toLowerCase());

        const clearEmbed = new EmbedBuilder();
        const errorImg = new AttachmentBuilder(config.embeds.images.errorImg);

        // Evaluate initial conditions (checks if the user has enogh permissions and that he has entered the correct commands or arguments)
        if (!message.member!.permissions.has([PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.ManageMessages])) {
            clearEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tienes permiso para usar este comando.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [clearEmbed], files: [errorImg] });
            return;
        }
        if (message.channel.type !== ChannelType.GuildText) {
            clearEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
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
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'Necesitas especificar la cantidad de mensajes entre 1 y 1000', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando: \`${prefix}clearchat <miembro(opcional)> <cantidad> \``)
            message.reply({ embeds: [clearEmbed], files: [errorImg] });
            return;
        }
        if (args.length > 2) {
            member = message.guild!.members.cache.get(args[1].replace(/[<@!&>]/g, '')) || message.guild!.members.cache.get(args[2].replace(/[<@!&>]/g, ''));
            if (member === undefined) {
                clearEmbed
                    .setColor(config.embeds.colors.errorColor as ColorResolvable)
                    .setAuthor({ name: 'El rol o usuario no existe. Intenta mencionarlos.', iconURL: 'attachment://error-icon.png' })
                    .setDescription(`Intenta ingresando: \`${prefix}clearchat <miembro(opcional)> <cantidad> \``)
                message.reply({ embeds: [clearEmbed], files: [errorImg] });
                return;
            }
        }
        if (!message.guild!.members.me!.permissions.has([PermissionsBitField.Flags.ManageMessages])) {
            clearEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tengo permisos para realizar esta acción.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [clearEmbed], files: [errorImg] });
            return;
        }

        let fetched;
        let limit;
        let counter: any = [];
        let filteredArray;
        let newArr;
        let oldmessages = false;
        const days14ms = 1209600000;
        const requested = totalLimit;
        do {
            // Check if the limit given by the user exceeds 100.
            totalLimit > 100 ? limit = 100 : limit = totalLimit;

            // Fetch messages.
            fetched = await message.channel.messages.fetch({ limit: limit });
            if (fetched.size < 1) break;

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

            // filter old messages.
            if (fetched.some(msg => Date.now() - msg.createdTimestamp > days14ms)) {
                fetched = fetched.filter(msg => Date.now() - msg.createdTimestamp < days14ms);
                oldmessages = true;
            }

            // Count messages.
            filteredArray = fetched.map(msg => msg.id);
            newArr = counter.concat(filteredArray);
            newArr = [...new Set([...counter, ...filteredArray])];
            counter = newArr;

            if (fetched.size < 100) break;
            totalLimit = requested - counter.length - 1;
        } while (totalLimit > 0)

        let msg = "mensaje";
        if (counter.indexOf(message.id) > -1) {
            counter.splice(counter.indexOf(message.id), 1);
        }
        let deleted = counter.length;
        if (deleted > 1 || deleted < 1) {
            msg = "mensajes";
        }

        if (oldmessages) {
            message.channel.send(`He borrado \`${deleted} ${msg}\`\nDebido a las limitaciones de Discord, no puedo eliminar mensajes que tengan más de \`14 días.\``).then(msg => setTimeout(() => msg.delete().catch(error => { }), 5000));
        } else {
            message.channel.send(`He borrado \`${deleted} ${msg}\``).then(msg => setTimeout(() => msg.delete().catch(error => { }), 5000));
        }

    }
}