// Joins a voice channel and plays the specified song.

import config from '../../config.json';
import { Client, Message, EmbedBuilder, AttachmentBuilder, ColorResolvable, Guild } from 'discord.js';
import { joinVoiceChannel, DiscordGatewayAdapterCreator, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, getVoiceConnection, VoiceConnection, AudioPlayer, PlayerSubscription } from '@discordjs/voice';
import ytdl, { downloadOptions, Filter } from 'ytdl-core';
import ytpl from 'ytpl';
import ytsr from 'ytsr';

// Queue for songs.
let queue: { title: string, duration: string, url: string, thumbnail: string }[] = [];

// queue(guildId, queueConstructor object {voice channel, text channel, connection, songQueue[ { title: string, duration: string, url: string, thumbnail: string, requester: string } ]})
// const queue = new Map();

export default {
    aliases: ['play', 'p', 'skip', 'pause', 'resume', 'loop', 'stop'],
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        let musicEmbed = new EmbedBuilder();
        const errorImg = new AttachmentBuilder(config.embeds.errorImg);

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

        // const serverQueue = queue.get(message.guild!.id); // queue based on the guild (server).
        const cmd = args[0]; // command given by the user.

        // Connect to voice channel if not already.
        let connection: VoiceConnection;
        if (message.guild!.members.me!.voice.channel) {
            connection = getVoiceConnection(message.guild!.id) as VoiceConnection;

        } else {
            connection = joinVoiceChannel({
                channelId: message.member!.voice.channelId!,
                guildId: message.guildId!,
                adapterCreator: message.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator
            })

        }

        // Get the requested song(s) from args.
        const input = args.slice(1).toString().replace(/,/g, " ");
        const player = createAudioPlayer();
        let subscription: any;

        // Check if the input is a URL. If not, then search for the song.
        if (this.validYTURL(input)) {

            // encoderArgs: ['-af', 'bass=g=10,dynaudnorm=f=200'] <-- Bass Boost

            // Get video metadata.
            const Id = input.split(/^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/s)[1].toString();
            const metadata = await this.getYTMetadata(Id);

            // Add video to the queue.
            queue.push({title: metadata.title, duration: metadata.durationTimestamp, url: metadata.url, thumbnail: metadata.thumbnail});

            // Play the audio.
            if (queue.length < 2) {
                subscription = this.playAudio(connection, player, metadata.url, musicEmbed, message);
            } else {
                musicEmbed
                    .setColor(config.embeds.defaultColor2 as ColorResolvable)
                    .setTitle(metadata.title)
                    .setURL(metadata.url)
                    .setAuthor({name: "Canción añadida a la cola ♪"})
                    .setDescription(`\`[0:00 / ${metadata.durationTimestamp}]\``)
                    .setThumbnail(metadata.thumbnail)
                    .setFooter({ text: `Añadida por ${message.member!.user.tag}`, iconURL: message.member!.displayAvatarURL({ forceStatic: false }) })
                message.channel.send({embeds: [musicEmbed]});
            }

        } else if (this.validSCURL(input)) {
            // Search for the song or playlist of songs on yt and play the song.
            message.reply('Lo siento, pero los enlaces de SoundCloud todavía no están soportados. :(');

        } else if(this.validSFURL(input)) {
            // play the song or playlist in soundclod.
            message.reply('Lo siento, pero los enlaces de Spotify todavía no están soportados. :(');

        } else {
            // Search for the song in youtube.
            // Get video metadata.
            const metadata = await this.getYTMetadata(input); 

            // Add video to the queue.
            queue.push({title: metadata.title, duration: metadata.durationTimestamp, url: metadata.url, thumbnail: metadata.thumbnail});

            if (queue.length < 2) {
                subscription = this.playAudio(connection, player, metadata.url, musicEmbed, message);
            } else {
                musicEmbed
                    .setColor(config.embeds.defaultColor2 as ColorResolvable)
                    .setTitle(metadata.title)
                    .setURL(metadata.url)
                    .setAuthor({name: "Canción añadida a la cola ♪"})
                    .setDescription(`\`[0:00 / ${metadata.durationTimestamp}]\``)
                    .setThumbnail(metadata.thumbnail)
                    .setFooter({ text: `Añadida por ${message.member!.user.tag}`, iconURL: message.member!.displayAvatarURL({ forceStatic: false }) })
                message.channel.send({embeds: [musicEmbed]});
            }

        }

        // -----------------------------------------------------
        // ---------------------- EVENTS -----------------------
        // -----------------------------------------------------
        
        subscription = player.on(AudioPlayerStatus.Idle, () => {
            // console.log('Song ended');

            // Song ended (Stop player and unsubscribe).
            player.stop();
            subscription!.unsubscribe();

            // Remove finished song from the queue.
            queue.shift();
            
            // Check if there is another song to play.
            if (queue.length >= 1) {
                subscription = this.playAudio(connection, player, queue[0].url, musicEmbed, message);
                return subscription;
            } else {
                // Disconnect from voice channel if queue is empty.
                connection.destroy();
            }
 
        })

        // Log Errors.
        // player.on('error', error => {
        //     console.log(error);
        // })

        connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 1000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 1000)
                ])
            } catch (error) {
                player.stop();
                subscription!.unsubscribe();
                queue = [];
                if (connection.state.status !== 'destroyed') {
                    connection.destroy();
                }
                musicEmbed = new EmbedBuilder()
                    .setColor(config.embeds.main as ColorResolvable)
                    .setAuthor({name: "Desconectada"})
                    .setColor(config.embeds.defaultColor2 as ColorResolvable)
                    .setDescription('Me he desconectado del canal de voz. Nos vemos!')
                    .setThumbnail(message.guild!.members.me!.displayAvatarURL())
                message.channel.send({embeds: [musicEmbed]});
            }
        })
    },

    // Check if a URL is valid (for youtube, soundcloud and spotify links).
    validYTURL(str: string) {
        const regexp = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/s;
        return regexp.test(str);
    },

    validSCURL(str: string){
        const regexp = /^(?:https?:\/\/)((?:www\.)|(?:m\.))?soundcloud\.com\/[a-z0-9](?!.*?(-|_){2})[\w-]{1,23}[a-z0-9](?:\/.+)?$/gm;
        return regexp.test(str);
    },

    validSFURL(str: string) {
        const regexp = /^(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(track\/|user\/(.*)\/playlist\/))(.*)$/mg;
        return regexp.test(str);
    }, 

    async getYTMetadata(search: string) {
        // const info = await ytdl.getInfo(url);
        // const title = info.videoDetails.title;
        // const thumbnail = info.videoDetails.thumbnails[0].url;
        // const durationMs = parseInt(info.videoDetails.lengthSeconds) * 1000;
        // let durationTimestamp;

        const info = await ytsr(search, {limit: 1}) as any;
        const url = info.items[0].url;
        const title = info.items[0].title;
        const thumbnail = info.items[0].bestThumbnail.url;
        // const durationMs = parseInt(info.videoDetails.lengthSeconds) * 1000;
        // let durationTimestamp;

        // if (durationMs < 3600000) {
        //     durationTimestamp = new Date(durationMs).toISOString().slice(14, 19);
        // } else {
        //     durationTimestamp = new Date(durationMs).toISOString().slice(11, 19);
        // }   
        
        const durationTimestamp = info.items[0].duration;
        return {title, durationTimestamp, thumbnail, url};
    },

    playAudio(connection: VoiceConnection, player: AudioPlayer, url: string, musicEmbed: EmbedBuilder, message: Message) {
        
        // Send message for current playing song (fisrt in queue).
        const currentSong = queue[0];
        musicEmbed
            .setColor(config.embeds.main as ColorResolvable)
            .setTitle(currentSong.title)
            .setURL(currentSong.url)
            .setAuthor({name: "Ahora Suena ♪"})
            .setDescription(`\`[0:00 / ${currentSong.duration}]\``)
            .setThumbnail(currentSong.thumbnail)
            .setFooter({ text: `Pedida por ${message.member!.user.tag}`, iconURL: message.member!.displayAvatarURL({ forceStatic: false }) })
        message.channel.send({embeds: [musicEmbed]});
        
        
        // Get audio from video.
        //const optionsLive = { highWaterMark: 1 <25, dlChunkSize: 0, quality: [91,92,93,94,95], opusEncoded: true, liveBuffer: 4900 } as downloadOptions;
        const optionsNormal = { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1<<25 } as downloadOptions;

        let stream = ytdl(url, optionsNormal);

        // Create the audio player.
        const resource = createAudioResource(stream);
        player.play(resource);

        // Subscribe to the player.
        const subscription = connection.subscribe(player);

        return subscription;
    }
}