// Returns random "banana" size for the user. For fun!
// Copied from Nekotina xD.

import { Client, Message, EmbedBuilder, ColorResolvable, SlashCommandBuilder, PermissionsBitField, } from 'discord.js';
import MCommand from '../../Classes/MCommand';

export default {
    data: new SlashCommandBuilder()
        .setName('banana')
        .setDescription('Returns random "banana" size for the user.For fun!'),
    aliases: ['banana'],
    category: 'Random',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
    execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        // limits.
        const min = 7;
        const max = 21;

        // Generate random size and color.
        const randomSize = Math.floor(Math.random() * (max - min + 1) + min);
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);

        const bananaSizeEmbed = new EmbedBuilder()
            .setColor(randomColor as ColorResolvable)
            .setTitle(`La banana de ${message.member!.displayName} mide ${randomSize} cm.`)
            .setImage("https://cdn.discordapp.com/attachments/755529601333067940/853072892702490624/banana.png");
        message.reply({ embeds: [bananaSizeEmbed], allowedMentions: { repliedUser: false } });
    }
} as MCommand