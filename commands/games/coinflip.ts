// Returns random "banana" size for the user. For fun!
// Copied from Nekotina xD.

import { Client, Message, PermissionsBitField, ChatInputCommandInteraction, CacheType, SlashCommandSubcommandBuilder } from 'discord.js';
import MCommand from '../../Classes/MCommand'

export default {
    slashCategory: 'games',
    name: 'coinflip',
    description: 'Flip a coin',
    DM: true,
    subOptions: [],
    inputOptions: [],
    aliases: ['coinflip'],
    category: 'Juegos',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
    cooldown: 0,
    commandType: 'Slash&Prefix',

    execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        const random = Math.floor(Math.random() * 2);

        if (random == 1) {
            message.reply({ content: `🪙**${message.member!.displayName}** flipped a coin and got **Tails**`, allowedMentions: { repliedUser: false } });
            return;
        }
        message.reply({ content: `🪙**${message.member!.displayName}** flipped a coin and got **heads**`, allowedMentions: { repliedUser: false } });
    },

    executeSlash(interaction: ChatInputCommandInteraction<CacheType>) {
        const random = Math.floor(Math.random() * 1);

        const member = interaction.guild!.members.cache.get(interaction.member!.user.id);

        if (random == 1) {
            interaction.reply({ content: `🪙${member!.displayName} flipped a coin and got **Tails**` });
            return;
        }
        interaction.reply({ content: `🪙${member!.displayName} flipped a coin and got **heads**` });
    }
} as MCommand