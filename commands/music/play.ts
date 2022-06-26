// Joins a voice channel and plays the specified song.

import config from '../../config.json';
import { Client, Message, Permissions, MessageEmbed, MessageAttachment, ColorResolvable, VoiceChannel } from 'discord.js';
import { generateDependencyReport, joinVoiceChannel, DiscordGatewayAdapterCreator, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, getVoiceConnection, VoiceConnection } from '@discordjs/voice';
import ytdl from 'discord-ytdl-core';
import yts from 'yt-search';

export default {
    aliases: ['play', 'p',],
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        const musicEmbed = new MessageEmbed();
        const errorImg = new MessageAttachment(config.embeds.errorImg);

        let queue: { name: string, duration: string, url: string }[] = [];

        // Check that the user is in a voice channel.
        if (!message.member!.voice.channel) {
            message.reply("Necesitas estar dentro de un ****canal de voz****.");
            return;
        }

        // Initial Conditions.
        if (args.length < 2) {
            message.reply(`Necesitas ingresar el nombre de la canción. \nIntenta ingresando: \`${prefix}play <canción o URL del video>\``);
            return;
        }
        if (message.guild!.me!.voice.channel && message.member!.voice.channelId != message.guild!.me!.voice.channelId) {
            message.reply('Lo siento pero ya estoy dentro de un canal y no pienso moverme. Mejor ven tú UwU.');
            return;
        }
        if (!message.member!.voice.channel.viewable) {
            message.reply('Lo siento, pero no tengo permisos para unirme a ese canal de voz.');
            return;
        }

        // Get the requested song(s) from args.
        const input = args.slice(1).toString().replace(/,/g, " ");

        // Check if the input is a URL. If not, then search for the song.
        let url = input;
        if (!this.validURL(input)) {
            const search = await yts(input);
            url = search.videos[0].url;
        }

        // Connect to voice channel if not already.
        let connection: VoiceConnection;
        if (message.guild!.me!.voice.channel) {
            connection = getVoiceConnection(message.guild!.id) as VoiceConnection;

        } else {
            connection = joinVoiceChannel({
                channelId: message.member!.voice.channelId!,
                guildId: message.guildId!,
                adapterCreator: message.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator
            })

        }

        // encoderArgs: ['-af', 'bass=g=10,dynaudnorm=f=200'] <-- Bass Boost

        // Get audio from the video.
        let stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio', fmt: "mp3", highWaterMark: 1 << 25 });
        const player = createAudioPlayer();

        // Create the audio player.
        const resource = createAudioResource(stream);
        player.play(resource);

        // Subscribe to the player.
        const subscription = connection.subscribe(player);


        // Events.

        player.on(AudioPlayerStatus.Playing, () => {
            console.log('The Audio is playing.');
        })
        // player.on(AudioPlayerStatus.Idle, () => {
        //     console.log('Song ended');
        //     player.stop();
        //     subscription!.unsubscribe();
        //     connection.destroy();
        // })

        // Log Errors.
        player.on('error', error => {
            console.log(error);
        })

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5000)
                ])
            } catch (error) {
                player.stop();
                subscription!.unsubscribe();
                if (connection.state.status !== 'destroyed') {
                    connection.destroy();
                }
            }
        })
    },

    // Check if a URL is valid.
    validURL(str: string) {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return !!pattern.test(str);
    }
}