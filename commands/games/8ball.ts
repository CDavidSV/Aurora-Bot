 // Returns random "banana" size for the user. For fun!
// Copied from Nekotina xD.

import { Client, Message, SlashCommandBuilder, PermissionsBitField, ChatInputCommandInteraction, CacheType } from 'discord.js';
import MCommand from '../../Classes/MCommand'

export default {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Flip a coin'),
    aliases: ['8ball'],
    category: 'Juegos',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
    cooldown: 0,
    commandType: 'Slash&Prefix',

    execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        message.reply('Working on it');
    },

    executeSlash(interaction: ChatInputCommandInteraction<CacheType>) {
        interaction.reply('Working on it too');
    }
} as MCommand