// Returns the prefix for that server.
import { CacheType, ChatInputCommandInteraction, Client, Message, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import MCommand from '../../Classes/MCommand';
const prefixScheema = require('../../mongoDB/schemas/prefix-scheema');

export default {
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Returns the prefix for that server.')
        .setDMPermission(false),
    aliases: ['prefix'],
    category: 'Utilidad',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
    cooldown: 0,
    commandType: "Slash&Prefix",
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        // Get server's prefix.
        let guildId = message.guildId;
        const ServerPrefix = await prefixScheema.findOne({ _id: guildId });
        let messageContent: string;
        if (!ServerPrefix) {
            messageContent = 'Este servidor no tiene un prefijo. \n`Intenta: ma!setprefix <prefijo>`';
        } else {
            messageContent = `El prefijo para este servidor es: \`${ServerPrefix.prefix}\``;
        }

        message.reply({ content: messageContent });
    },

    async executeSlash(interaction: ChatInputCommandInteraction<CacheType>) {
        let guildId = interaction.guildId;
        const ServerPrefix = await prefixScheema.findOne({ _id: guildId });
        let messageContent: string;
        if (!ServerPrefix) {
            messageContent = 'Este servidor no tiene un prefijo. \n`Intenta: ma!setprefix <prefijo>`';
        } else {
            messageContent = `El prefijo para este servidor es: \`${ServerPrefix.prefix}\``;
        }

        interaction.reply({ content: messageContent, ephemeral: true });
    }
} as MCommand;