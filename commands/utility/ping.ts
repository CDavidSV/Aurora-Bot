// Shows the bots responce time and the API's Latency.

import { Client, Message, MessageEmbed, ColorResolvable } from 'discord.js';
import config from '../../config.json';

export default {
    execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        // Calculate difference in time between responce and initial message.
        const pingEmbed = new MessageEmbed().setDescription('Calculating...');
        message.channel.send({ embeds: [pingEmbed] }).then(async resultMessage => {
            const ping = resultMessage.createdTimestamp - message.createdTimestamp;
            pingEmbed
                .setAuthor({ name: 'Marin Bot', iconURL: client.user!.avatarURL()! })
                .setDescription('')
                .setColor(config.embeds.main as ColorResolvable)
                .addFields(
                    { name: 'Bot Latency: ', value: `${ping}ms` },
                    { name: 'API Latency: ', value: `${client.ws.ping}ms` }
                )
                .setFooter({ text: config.version })
                .setTimestamp()
            await resultMessage.edit({ embeds: [pingEmbed] });
        })
    }
}