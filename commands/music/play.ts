// Joins a voice channel and plays the specified song.

import config from '../../config.json';
import { Client, Message, Permissions, MessageEmbed, MessageAttachment, ColorResolvable, VoiceChannel } from 'discord.js';
import { joinVoiceChannel, DiscordGatewayAdapterCreator } from '@discordjs/voice';

export default {
    execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        const connection = joinVoiceChannel({
            channelId: message.member!.voice.channelId!,
            guildId: message.guildId!,
            adapterCreator: message.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator
        })
    }
}