// Dissables all filters.

import { getVoiceConnection } from "@discordjs/voice";
import { Client, ColorResolvable, EmbedBuilder, Message } from "discord.js";
import playercore from "../../player/playercore";
import config from '../../config.json';

export default {
    aliases: ['filters'],
    // Main function.
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        if (!message.member!.voice.channel) {
            message.reply("Necesitas estar dentro de un ****canal de voz****.");
            return;
        }
        if (message.guild!.members.me!.voice.channel && message.member!.voice.channelId != message.guild!.members.me!.voice.channelId) {
            message.reply('Lo siento pero ya estoy dentro de un canal y no pienso moverme. Mejor ven tú UwU.');
            return;
        }
        if (!message.member!.voice.channel.viewable) {
            message.reply('Lo siento, pero no tengo permisos para unirme a ese canal de voz.');
            return;
        }
        // Check if there is a voice connection.
        if (!getVoiceConnection(message.guildId!)) {
            message.reply(`No hay un reproductor activo en este servidor \n\`Intenta: ${prefix}play <canción o url>\``);
            return;
        }

        // check if there are songs in the queue.
        const serverQueue = playercore.getServerQueues().get(message.guildId!);
        const filters = serverQueue!.filters;

        if (filters.length < 1) {
            message.reply('No hay filtros activos.');
            return;
        }

        const filtersEmbed = new EmbedBuilder()
            .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
            .setTitle('Filtros activos ♪')
            .setDescription(filters.toString().replace(',', '\n'))
    }
}