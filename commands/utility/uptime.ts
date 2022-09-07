// Shows the bot's uptime.
import { Client, Message, EmbedBuilder, ColorResolvable } from 'discord.js';
import config from '../../config.json';
import startTime from '../../events/ready';

export default {
    aliases: ['uptime'],
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        const uptime = Date.now() - startTime;
        const days = Math.floor(uptime / 86400000);
        const hours = Math.floor(uptime / 3600000) % 24;
        const min = Math.floor(uptime / 60000) % 60;
        const sec = Math.floor(uptime / 1000) % 60;

        let currentUptime: string = '';
        if (days !== 0) {
            currentUptime += `${days}d `;
        }
        if (hours !== 0) {
            currentUptime += `${hours}h `;
        }
        if (min !== 0) {
            currentUptime += `${min}m `;
        }
        currentUptime += `${sec}s`;


        const uptimeEmbed = new EmbedBuilder()
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setAuthor({ name: client.user!.username, iconURL: client.user!.avatarURL({ forceStatic: false })! })
            .setFields(
                { name: "Tiempo Local", value: `<t:${Math.round(Date.now() / 1000)}> `, inline: false },
                { name: "Tiempo de actividad actual", value: `${currentUptime}`, inline: true },
                { name: "Inicio", value: `<t:${Math.round(startTime / 1000)}> `, inline: true }
            )
        message.channel.send({ embeds: [uptimeEmbed] });
    }
}