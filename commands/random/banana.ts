// Returns random "banana" size for the user. For fun!
// Copied from Nekotina xD.

import { Client, Message, EmbedBuilder, ColorResolvable, SlashCommandBuilder, PermissionsBitField, ChatInputCommandInteraction, CacheType, GuildMember, User, } from 'discord.js';
import MCommand from '../../Classes/MCommand'

function generateRandom() {
    // limits.
    const min = 7;
    const max = 21;

    const randomSize = Math.floor(Math.random() * (max - min + 1) + min);
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);

    return { size: randomSize, color: randomColor };
}


export default {
    data: new SlashCommandBuilder()
        .setName('banana')
        .setDescription('Returns random "banana" size for the user.For fun!'),
    aliases: ['banana'],
    category: 'Random',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
    cooldown: 0,
    commandType: 'Slash&Prefix',

    execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        // Generate random size and color.
        const random = generateRandom();

        const bananaSizeEmbed = new EmbedBuilder()
            .setColor(random.color as ColorResolvable)
            .setTitle(`La banana de ${message.member!.displayName} mide ${random.size} cm.`)
            .setImage("https://cdn.discordapp.com/attachments/755529601333067940/853072892702490624/banana.png");
        message.reply({ embeds: [bananaSizeEmbed], allowedMentions: { repliedUser: false } });
    },

    executeSlash(interaction: ChatInputCommandInteraction<CacheType>) {
        // Generate random size and color.
        const random = generateRandom();
        const member = interaction.member as GuildMember;

        let username;
        if(!member) {
            username = interaction.user.username as string;
        } else {
            username = member.displayName;
        }

        const bananaSizeEmbed = new EmbedBuilder()
            .setColor(random.color as ColorResolvable)
            .setTitle(`La banana de ${username} mide ${random.size} cm.`)
            .setImage("https://cdn.discordapp.com/attachments/755529601333067940/853072892702490624/banana.png");
        interaction.reply({ embeds: [bananaSizeEmbed], allowedMentions: { repliedUser: false } });
    }
} as MCommand