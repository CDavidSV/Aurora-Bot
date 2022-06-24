// Joins a voice channel and plays the specified song.

import config from '../../config.json';
import { Client, Message, Permissions, MessageEmbed, MessageAttachment, ColorResolvable, VoiceChannel } from 'discord.js';
import { generateDependencyReport, joinVoiceChannel, DiscordGatewayAdapterCreator, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } from '@discordjs/voice';
import ytdl from 'ytdl-core';
import ytSearch from 'yt-search';

export default {
    aliases: ['play', 'p',],
    execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        const musicEmbed = new MessageEmbed();
        const errorImg = new MessageAttachment(config.embeds.errorImg);

        // Check that the user is in a voice channel.
        if (!message.member!.voice.channel) {
            message.reply("Necesitas estar dentro de un ****canal de voz****.");
            return;
        }

        const player = createAudioPlayer();

        player.on(AudioPlayerStatus.Playing, () => {
            console.log('The Audio is playing.');
        })
        player.on(AudioPlayerStatus.Idle, () => {
            console.log('Song ended');
            player.stop();
            subscription!.unsubscribe();
            connection.destroy();
        })

        // Log Errors.
        player.on('error', error => {
            console.log(error);
        })

        // Create the audio player.
        const resource = createAudioResource('D:\\GitHub\\Marin-Bot\\Test-Songs\\Lullaby.mp3');
        player.play(resource);

        // Connect to voice channel.
        const connection = joinVoiceChannel({
            channelId: message.member!.voice.channelId!,
            guildId: message.guildId!,
            adapterCreator: message.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator
        })
        const subscription = connection.subscribe(player);

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5000)
                ])
            } catch (error) {
                player.stop();
                subscription!.unsubscribe();
                connection.destroy();
            }
        })
    }
}