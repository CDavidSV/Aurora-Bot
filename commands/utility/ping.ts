// Shows the bot's responce time and the API's Latency.
import { Message, EmbedBuilder, ColorResolvable, SlashCommandBuilder, ChatInputCommandInteraction, CacheType, PermissionsBitField, Embed, Client } from 'discord.js';
import MCommand from '../../Classes/MCommand';
import config from '../../config.json';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription("Shows the bot's responce time and the API's Latency."),
    aliases: ['ping'],
    category: 'Utilidad',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        // Calculate difference in time between responce and initial message.
        const pingEmbed = new EmbedBuilder().setDescription('Calculating...');

        message!.channel.send({ embeds: [pingEmbed] }).then(async resultMessage => {
            const ping = resultMessage.createdTimestamp - message!.createdTimestamp;
            pingEmbed
                .setAuthor({ name: 'Marin Bot', iconURL: client!.user!.avatarURL()! })
                .setDescription('🏓Pong!')
                .setColor(config.embeds.colors.main as ColorResolvable)
                .addFields(
                    { name: 'Bot Latency: ', value: `\`${ping}ms\`` },
                    { name: 'API Latency: ', value: `\`${client!.ws.ping}ms\`` }
                )
                .setFooter({ text: config.version })
                .setTimestamp()
            await resultMessage.edit({ embeds: [pingEmbed] });
        })

    }
} as MCommand