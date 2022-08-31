// Command to play a requested song.

import { Client, Message } from 'discord.js';
import playercore from '../../player/playercore';
import { getVoiceConnection, joinVoiceChannel, DiscordGatewayAdapterCreator } from '@discordjs/voice';

export default {
    aliases: ['play', 'p'],
    // Main function.
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        if (!message.member!.voice.channel) {
            message.reply("Necesitas estar dentro de un ****canal de voz****.");
            return;
        }
        if (args.length < 2) {
            message.reply(`Necesitas ingresar el nombre de la canción. \nIntenta ingresando: \`${prefix}play <canción o URL del video>\``);
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
        // Get the requested song(s) from args.
        const song = args.slice(1).toString().replace(/,/g, " ");

        // Check if there is a voice connection.
        if (!getVoiceConnection(message.guildId!)) {
            // Join voice channel.
            joinVoiceChannel({
                channelId: message.member!.voice.channelId!,
                guildId: message.guildId!,
                adapterCreator: message.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator
            })
        }

        playercore.play(message, song);
    }
}