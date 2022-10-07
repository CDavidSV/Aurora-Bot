// Change the server's prefix.

import { Message, EmbedBuilder, AttachmentBuilder, ColorResolvable, PermissionsBitField, SlashCommandBuilder, CacheType, ChatInputCommandInteraction, Client } from 'discord.js';
import MCommand from '../../Classes/MCommand';
import config from '../../config.json';
const prefixScheema = require('../../mongoDB/schemas/prefix-scheema');
import prefixHandler from '../../handlers/prefix-handler';

export default {
    data: new SlashCommandBuilder()
        .setName('setprefix')
        .setDescription("Change the server's prefix.")
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addStringOption(option =>
            option.setName('prefix')
                .setDescription('El nuevo prefijo para el servidor')
                .setRequired(true)
                .setMaxLength(3)
                .setMinLength(1)),
    aliases: ['setprefix'],
    category: 'Utilidad',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        const errorImg = new AttachmentBuilder('./assets/command-images/error-icon.png');
        const successImg = new AttachmentBuilder('./assets/command-images/success-icon.png');
        const setPrefixEmbed = new EmbedBuilder();

        // Evaluate initial conditions (checks if the user has enogh permissions and that he has entered the correct commands or arguments)
        if (!message.member!.permissions.has([PermissionsBitField.Flags.Administrator])) {
            setPrefixEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'No tienes permiso para usar este comando.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [setPrefixEmbed], files: [errorImg] });
            return;
        }
        if (args.length < 2) {
            setPrefixEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'Debes de Ingresar el prefijo que quieres tener en tu servidor.', iconURL: 'attachment://error-icon.png' })
                .setDescription(`Intenta ingresando: \`${prefix}setprefix <prefijo>\``)
            message.reply({ embeds: [setPrefixEmbed], files: [errorImg] });
            return;
        }
        if (args[1].length > 3) {
            setPrefixEmbed
                .setColor(config.embeds.colors.errorColor as ColorResolvable)
                .setAuthor({ name: 'Los prefijos no pueden ser cadenas de más de tres caracteres.', iconURL: 'attachment://error-icon.png' })
            message.reply({ embeds: [setPrefixEmbed], files: [errorImg] });
            return;
        }

        const guildId = message.guildId;
        const newPrefix = args[1];

        // Change the prefix and update the database.
        await prefixScheema.findOneAndUpdate({
            _id: guildId
        }, {
            _id: guildId,
            prefix: newPrefix
        }, {
            upsert: true
        })
        prefixHandler.updateGuildPrefix(guildId as string, newPrefix!);

        setPrefixEmbed
            .setColor(config.embeds.colors.successColor as ColorResolvable)
            .setAuthor({ name: `El prefijo del servidor se cambió a ${newPrefix}`, iconURL: 'attachment://success-icon.png' })

        // Depending if the command is slash command or not.
        message.reply({ embeds: [setPrefixEmbed], files: [successImg] });
    }
} as MCommand