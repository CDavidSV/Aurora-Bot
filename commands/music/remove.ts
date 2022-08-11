// Removes the selected song from queue.

import { Client, Message } from 'discord.js';
import playercore from '../../handlers/player/playercore';
import { getVoiceConnection } from '@discordjs/voice';

export default {
    aliases: ['remove'],
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
        // Check if there is a voice connection.
        if (!getVoiceConnection(message.guildId!)) {
            message.reply(`No hay un reproductor activo en este servidor \n\`Intenta: ${prefix}play <canción o url>\``);
            return;
        }
        if (args.length < 2) {
            message.reply(`Necesitas ingresar el indice de la canción. \nIntenta: \`${prefix}remove <numero en la lista>\``);
            return;
        }

        const index = parseInt(args[1]);

        if (index <= 0) {
            message.reply('El número de indice debe de ser mayor a 0.');
            return;
        }
        // check if there are songs in the queue.
        if (index > playercore.getServerQueue(message.guildId!).queue.length - 1) {
            message.reply(`Esa canción no esta en la cola. \nIntenta agragando una usando: \`${prefix}play <canción o url>\``);
            return;
        }

        playercore.remove(message.guildId!, index);
    }
}