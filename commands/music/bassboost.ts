// Add bassboost to the stream.

import { getVoiceConnection } from "@discordjs/voice";
import { Client, Message, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import MCommand from "../../Classes/MCommand";
import playercore from "../../player/playercore";

export default {
    data: new SlashCommandBuilder()
        .setName('bassboost')
        .setDescription("Add bassboost to the song."),
    aliases: ['bassboost'],
    category: 'Música',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
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
        if (!serverQueue || !serverQueue!.playing) {
            message.reply(`No hay ninguna canción reproduciendose.`);
            return;
        }

        playercore.bassBoost(message.guildId!, message.member!);

    }
} as MCommand