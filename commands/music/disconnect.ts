// Leaves the voice channel.

import config from '../../config.json';
import { Client, Message, Permissions, MessageEmbed, MessageAttachment, ColorResolvable, VoiceChannel } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
export default {
    execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        const connection = getVoiceConnection(message.guild!.id);
        connection!.destroy(); // destroy connection.
    }
}