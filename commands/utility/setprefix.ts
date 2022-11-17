// Change the server's prefix.

import { Message, EmbedBuilder, AttachmentBuilder, ColorResolvable, PermissionsBitField, SlashCommandBuilder, CacheType, ChatInputCommandInteraction, Client } from 'discord.js';
import MCommand from '../../Classes/MCommand';
import config from '../../config.json';
const prefixScheema = require('../../mongoDB/schemas/prefix-scheema');
import prefixHandler from '../../handlers/prefix-handler';

const errorImg = new AttachmentBuilder('./assets/command-images/error-icon.png');
const successImg = new AttachmentBuilder('./assets/command-images/success-icon.png');

async function changePrefix(newPrefix: string, guildId: string | null) {
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
}

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
                .setMinLength(1))
        .setDMPermission(false),
    aliases: ['setprefix'],
    category: 'Utilidad',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [PermissionsBitField.Flags.Administrator],
    cooldown: 0,
    commandType: 'Slash&Prefix',
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        const setPrefixEmbed = new EmbedBuilder();

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

        changePrefix(newPrefix, guildId);

        setPrefixEmbed
            .setColor(config.embeds.colors.successColor as ColorResolvable)
            .setAuthor({ name: `El prefijo del servidor se cambió a ${newPrefix}`, iconURL: 'attachment://success-icon.png' })

        // Depending if the command is slash command or not.
        message.reply({ embeds: [setPrefixEmbed], files: [successImg] });
    },

    async executeSlash(interaction: ChatInputCommandInteraction<CacheType>) {
        const setPrefixEmbed = new EmbedBuilder();

        const guildId = interaction.guildId;
        const newPrefix = interaction.options.getString('prefix', true);

        changePrefix(newPrefix, guildId);

        setPrefixEmbed
            .setColor(config.embeds.colors.successColor as ColorResolvable)
            .setAuthor({ name: `El prefijo del servidor se cambió a ${newPrefix}`, iconURL: 'attachment://success-icon.png' })

        // Depending if the command is slash command or not.
        interaction.reply({ embeds: [setPrefixEmbed], files: [successImg] });
    }
} as MCommand