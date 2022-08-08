// Change the server's prefix.

import mongo from '../../mongoDB/mongo';
import { Client, Message, Permissions, EmbedBuilder, AttachmentBuilder, ColorResolvable, PermissionsBitField } from 'discord.js';
import config from '../../config.json';
const prefixScheema = require('../../mongoDB/schemas/prefix-scheema');

export default {
    aliases: ['setprefix'],
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        const errorImg = new AttachmentBuilder('./assets/command-images/error-icon.png');
        const successImg = new AttachmentBuilder('./assets/command-images/success-icon.png');
        const setPrefixEmbed = new EmbedBuilder();

        // Evaluate initial conditions (checks if the user has enogh permissions and that he has entered the correct commands or arguments)
        if (!message.member!.permissions.has([PermissionsBitField.Flags.Administrator])) {
            setPrefixEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tienes permiso para usar este comando.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [setPrefixEmbed], files: [errorImg] });
            return;
        }
        if (args.length < 2) {
            setPrefixEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'Debes de Ingresar el prefijo que quieres tener en tu servidor.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando: \`${prefix}setprefix <prefijo>\``)
            message.reply({ embeds: [setPrefixEmbed], files: [errorImg] });
            return;
        }
        if (!isNaN(Number(args[1])) || args[1].length > 3) {
            setPrefixEmbed
                .setColor(config.embeds.errorColor as ColorResolvable)
                .setAuthor({ name: 'Los prefijos no pueden ser números o cadenas de más de tres caracteres.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [setPrefixEmbed], files: [errorImg] });
            return;
        }

        await mongo().then(async mongoose => {
            try {
                const guildId = message.guild!.id;
                await prefixScheema.findOneAndUpdate({
                    _id: guildId
                }, {
                    _id: guildId,
                    prefix: args[1]
                }, {
                    upsert: true
                })
                setPrefixEmbed
                    .setColor(config.embeds.successColor as ColorResolvable)
                    .setAuthor({ name: `El prefijo del servidor se cambió a ${args[1]}`, iconURL: 'attachment://success-icon.png' })
                message.reply({ embeds: [setPrefixEmbed], files: [successImg] });
            } finally {
                mongoose.connection.close();
            }
        })
    }
}