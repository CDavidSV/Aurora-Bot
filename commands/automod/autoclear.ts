// Automatically clears messages in the mentioned channel with a specified time.
import mongo from '../../mongo';
const autoclearScheema = require('../../schemas/autoclear-scheema');
import { Client, Message, Permissions, MessageEmbed, MessageAttachment, ColorResolvable, TextChannel, GuildChannel, Channel } from 'discord.js';
import config from '../../config.json';
import clear from '../../updateObjects';

export default {
    // Function that clears all messages in the channel.
    async clearMessages(client: Client, message: Message) {
        // Channels array.
        let guildChannels: any[] = [];
        // Get channels document from database.
        mongo().then(async (mongoose) => {
            try {
                const guildIds = client.guilds.cache.map(guild => guild.id)
                for (const guildId of guildIds) {
                    const results = await autoclearScheema.findOne({ "_id": guildId });
                    if (!(results === null)) {
                        guildChannels.push(results);
                    }
                }
                for (const guildChannel of guildChannels) {
                    for (const channel of guildChannel.channels) {
                        // Contains all messages withing the established limit.
                        let fetch;
                        // Loop to clear all messages until limit or max time is reached.
                        do {
                            const guild = client.guilds.cache.get(guildChannel._id);
                            const channelObj = guild!.channels.cache.get(channel.channelId)! as TextChannel;
                            fetch = await channelObj.messages.fetch({ limit: 100 });
                            const currTime = Date.now();
                            if (fetch.size < 1) break;
                            if (currTime - fetch.first()!.createdTimestamp > 1209600) {
                                channelObj.send('No se pueden eliminar mensajes que tengan más de 14 días.');
                                break;
                            };
                            await channelObj.bulkDelete(fetch, true);
                        } while (true)
                    }
                }
            } finally {
                mongoose.connection.close();
                console.log('Runs every minute...');
            }
        });
    },

    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        // All actions for autoclear command.
        const actions = ['enable', 'disable', 'modify'];

        // Channels array.
        let channels: { channelId: string, time: string[] }[] = [];

        // Embed images.
        const errorImg = new MessageAttachment('./assets/command-images/error-icon.png');
        const successImg = new MessageAttachment('./assets/command-images/success-icon.png');
        const autoClearEmbed = new MessageEmbed();

        // Evaluate user permissions.
        if (!message.member!.permissions.has([Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_MESSAGES])) {
            autoClearEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tienes permiso para usar este comando.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [autoClearEmbed], files: [errorImg] });
            return;
        }

        // Check that command is entered correctly.
        if ((args.length <= 1 || !actions.includes(args[1]))) {
            autoClearEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'Esta acción no existe o no es especificada.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando:\n \`${prefix}autoclear <enable> <#canal> <tiempo>\`\n\`${prefix}autoclear <disable> <#Canal>\`\n\`${prefix}autoclear <modify> <#Canal> <tiempo>\``)
            message.reply({ embeds: [autoClearEmbed], files: [errorImg] });
            return;
        }
        if (args.length <= 3 && args[1] !== 'disable') {
            autoClearEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'Esta acción requiere mencionar el canal e indicar el tiempo.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando:\n \`${prefix}autoclear <enable, modify> <#canal> <tiempo>\` \n \`${prefix}autoclear <disable> <#canal>\` \n**Tiempo:** Este valor no puede superar los 14 días.`)
                .addField('Tiempo ', '(segundos, minutos, horas, días)')
                .setFields(
                    { name: 'Minutos: ', value: 'Ejemplo: 5m, 30m, 90m' },
                    { name: 'Horas: ', value: 'Ejemplo: 2h, 7h, 72h' },
                    { name: 'Días: ', value: 'Ejemplo: 1d, 7d, 12d' }
                )
            message.reply({ embeds: [autoClearEmbed], files: [errorImg] });
            return;
        }

        // Specified parameters.
        const action = args[1];
        const channelId = args[2].replace(/[<#!&>]/g, '');
        const channel = message.guild!.channels.cache.get(channelId)!;
        const time = args.slice(3, args.length);

        // Check if the channel is valid or does not exist.
        if (!channel) {
            autoClearEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'Este canal no existe. Intenta mencionándolo.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [autoClearEmbed], files: [errorImg] });
            return;
        }

        // Check if the channel is a text channel.
        if (!(channel.type === "GUILD_TEXT")) {
            autoClearEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'Solo se pueden eliminar mensajes en canales de texto.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [autoClearEmbed], files: [errorImg] });
            return;
        }

        // Get channels document from database.
        await mongo().then(async (mongoose) => {
            try {
                const results = await autoclearScheema.findOne({ "_id": message.guildId });
                if (!(results === null)) {
                    channels = results.channels;
                }
            } finally {
                mongoose.connection.close();
            }
        })

        // Evaluates the selected action.
        switch (action) {
            case 'enable':
                if (channels.some(channel => channel.channelId === channelId)) {
                    autoClearEmbed
                        .setColor(config.embeds.errorColor as ColorResolvable)
                        .setAuthor({ name: 'Este canal ya fue agregado.', iconURL: 'attachment://error-icon.png' })
                        .setDescription(`Intenta Ingresando: \`${prefix}autoclear <modify> <#canal> <tiempo>\``)
                    message.reply({ embeds: [autoClearEmbed], files: [errorImg] });
                    return;
                }
                channels.push({ channelId: channelId, time: time });
                console.log(channels);

                break;
            case 'disable':
                const len = channels.length;
                channels = channels.filter(channel => channel.channelId !== channelId);
                if (channels.length === len) {
                    autoClearEmbed
                        .setColor(config.embeds.errorColor as ColorResolvable)
                        .setAuthor({ name: 'Este canal aún no ha sido agregado.', iconURL: 'attachment://error-icon.png' })
                        .setDescription(`Intenta Ingresando: \`${prefix}autoclear <enable> <#canal> <tiempo>\``)
                    message.reply({ embeds: [autoClearEmbed], files: [errorImg] });
                    break;
                }
                break;
            case 'modify':
                try {
                    channels[channels.findIndex(channel => channel.channelId === channelId)].time = time;
                } catch (error) {
                    autoClearEmbed
                        .setColor(config.embeds.errorColor as ColorResolvable)
                        .setAuthor({ name: 'Este canal aun no se ha agregado.', iconURL: 'attachment://error-icon.png' })
                        .setDescription(`Intenta Ingresando: \`${prefix}autoclear <enable> <#canal> <tiempo>\``)
                    message.reply({ embeds: [autoClearEmbed], files: [errorImg] });
                    return;
                }
                break;
        }

        // Modify document in database.
        await mongo().then(async (mongoose) => {
            try {
                await autoclearScheema.findOneAndUpdate({
                    _id: message.guildId
                }, {
                    channels
                }, {
                    upsert: true
                })
            } finally {
                mongoose.connection.close();
            }
        })
        clear.updateAutoClear(client);
    }
}