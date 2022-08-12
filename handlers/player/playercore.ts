// Handler for playing music in a voice channel.

import config from '../../config.json';
import { Client, Message, EmbedBuilder, ColorResolvable, User, TextChannel } from 'discord.js';
import { createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, getVoiceConnection, AudioPlayer, PlayerSubscription, AudioResource } from '@discordjs/voice';
import ytdl, { downloadOptions } from 'ytdl-core';
import ytsr from 'ytsr';
import ytpl from 'ytpl';
import { Connection } from 'mongoose';

// serverQueues{guildId, queueConstructor{}}
const serverQueues = new Map();
const songEmbed = new EmbedBuilder();

export default {
    // Plays the requested song in the designate voice channel.
    async play(client: Client, message: Message, song: string) {
        // Youtube Regexes.
        const YTVideoRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/watch\?v=(.*)$/;
        const YTMixRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/watch\?v=(.*)[\?|&](list=)(.*)$/;
        const YTPlaylistRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/playlist\?list=(.*)$/;

        // Youtube Music Regexes.
        // Working on it...

        // Spotify regexes.
        const spotifySongRegex = /^(https?:\/\/)?(www\.)?(open\.spotify\.com\/track\/)(.*)$/;
        const spotifyPlaylistRegex = /^(https?:\/\/)?(www\.)?(open\.spotify\.com\/playlist\/)(.*)$/;
        const spotifyAlbumRegex = /^(https?:\/\/)?(www\.)?(open\.spotify\.com\/album\/)(.*)$/;

        // SoundCloud Regexes.
        // Working on it... Still don't know how.

        // find the source based on the users request (can be either a link or search query).
        let songQueue: { type: string, title: string | null, url: string | null; durationTimestamp: string | null; thumbnail: string | null, requester: User }[] = [];
        let metadata: { title: string | null; url: string | null; durationTimestamp: string | null; thumbnail: string | null; embedTitle: string | null; embedDescription: string | null; playlist: ytpl.Result | null };
        const requester = message.member!.user;

        if (YTVideoRegex.test(song) || YTPlaylistRegex.test(song) || YTMixRegex.test(song)) {
            // Generate a queue if the link is a playlist.
            if (YTPlaylistRegex.test(song) || YTMixRegex.test(song)) {
                try {
                    metadata = await getMetadata(song, 'ytplaylist');
                    const playlist = metadata.playlist!;
                    for (let item = 0; item < playlist.items.length; item++) {
                        songQueue.push({ type: 'youtube', title: playlist.items[item].title, url: playlist.items[item].url, durationTimestamp: playlist.items[item].duration, thumbnail: playlist.items[item].bestThumbnail.url, requester: requester });
                    }
                } catch {
                    // Could not find the playlist (Mixes not yet supported).
                    metadata = await getMetadata(song, 'ytvideo');
                    songQueue.push({ type: 'youtube', title: metadata.title, url: song, durationTimestamp: metadata.durationTimestamp, thumbnail: metadata.thumbnail, requester: requester });
                }
            } else {
                console.log(1);
                metadata = await getMetadata(song, 'ytvideo');
                songQueue.push({ type: 'youtube', title: metadata.title, url: song, durationTimestamp: metadata.durationTimestamp, thumbnail: metadata.thumbnail, requester: requester });
            }
        } else if (spotifySongRegex.test(song)) {
            message.channel.send('Lo siento, pero todavia no soportamos spotify.');
            return;
        } else if (spotifyPlaylistRegex.test(song) || spotifyAlbumRegex.test(song)) {
            message.channel.send('Lo siento, pero todavia no soportamos spotify.');
            return;
        } else {
            const search = await ytsr(song, { limit: 1 }) as any;
            if (search.items.length < 1) {
                message.channel.send('No se han encontrado resultados. Prueba diferentes palabras clave o revisa el enlace ingresado.');
                return;
            }
            song = search.items[0].url;
            metadata = await getMetadata(song, 'ytvideo');
            songQueue.push({ type: 'youtube', title: metadata.title, url: song, durationTimestamp: metadata.durationTimestamp, thumbnail: metadata.thumbnail, requester: requester });
        }

        // Check if a queue exists for that server. If not, then generate one.
        const guildId = message.guildId!;
        let serverQueue = serverQueues.get(guildId);
        if (!serverQueue) {
            const connection = getVoiceConnection(guildId)!;
            const player = createAudioPlayer();
            let subscription = connection.subscribe(player) as PlayerSubscription;
            const queueConstructor = {
                guildId: guildId,
                textChannelId: message.channelId,
                subscription: subscription,
                songQueue: songQueue as { type: string, title: string | null, url: string | null; durationTimestamp: string | null; thumbnail: string | null, requester: User }[]
            }
            serverQueues.set(guildId, queueConstructor);
            serverQueue = serverQueues.get(guildId);

            if (serverQueue.songQueue.length > 1) {
                songEmbed
                    .setColor(config.embeds.defaultColor as ColorResolvable)
                    .setTitle(metadata.title)
                    .setURL(metadata.url)
                    .setAuthor({ name: metadata.embedTitle as string })
                    .setDescription(metadata.embedDescription as string)
                    .setThumbnail(metadata.thumbnail)
                    .setFooter({ text: `Pedida por ${serverQueue.songQueue[0].requester.tag}`, iconURL: serverQueue.songQueue[0].requester.displayAvatarURL({ forceStatic: false }) })
                message.channel.send({ embeds: [songEmbed] });
            }
            // Generate stream depending on the source.
            let currentSong = serverQueue.songQueue[0];
            const { stream } = await getStream(currentSong);
            // Create the audio source and play it.
            let resource = createAudioResource(stream as any);
            player.play(resource);
            playManager(client, guildId, serverQueue);
        } else { // Add the requested song or playlist in queue.
            if (serverQueue.songQueue.length < 1) {
                serverQueue.songQueue.push(...songQueue);

                // Generate stream depending on the source.
                const player = serverQueue.subscription.player;
                let currentSong = serverQueue.songQueue[0];
                const { stream } = await getStream(currentSong);

                // Create the audio source and play it.
                let resource = createAudioResource(stream as any);
                player.play(resource);
                return;
            }
            serverQueue.songQueue.push(...songQueue);
            songEmbed
                .setColor(config.embeds.defaultColor2 as ColorResolvable)
                .setTitle(metadata.title)
                .setURL(metadata.url)
                .setAuthor({ name: metadata.embedTitle as string })
                .setDescription(metadata.embedDescription as string)
                .setThumbnail(metadata.thumbnail)
                .setFooter({ text: `Pedida por ${serverQueue.songQueue[0].requester.tag}`, iconURL: serverQueue.songQueue[0].requester.displayAvatarURL({ forceStatic: false }) })
            message.channel.send({ embeds: [songEmbed] });
            return;
        }

    },

    // Pauses the player for the selected guild.
    pause(guildId: string) {
        const serverQueue = serverQueues.get(guildId);
        serverQueue.subscription.player.pause();
        return;
    },

    // Resumes playback for the selected guild.
    resume(guildId: string) {
        const serverQueue = serverQueues.get(guildId);
        serverQueue.subscription.player.unpause();
        return;
    },

    // Skips a track for the selected guild.
    skip(guildId: string) {
        const serverQueue = serverQueues.get(guildId);
        serverQueue.subscription.player.stop();
        return;
    },

    remove(guildId: string, index: number) {
        const serverQueue = serverQueues.get(guildId)
        const newSongQueue = serverQueue.songQueue.splice(index, 1);
        const queueConstructor = {
            guildId: guildId,
            textChannelId: serverQueue.channelId,
            subscription: serverQueue.subscription,
            songQueue: newSongQueue as { type: string, title: string | null, url: string | null; durationTimestamp: string | null; thumbnail: string | null, requester: User }[]
        }

        serverQueues.set(guildId, queueConstructor);
        return;
    },

    // Returns the song queue for that particular guild.
    getServerQueue(guildId: string) {
        const serverQueue = serverQueues.get(guildId);
        const queue = serverQueue.songQueue;

        return { queue };
    }

}

async function getStream(currentSong: any) {
    let stream;

    switch (currentSong.type) {
        case 'youtube':
            // Get audio from video.
            // const optionsLive = { highWaterMark: 1 <25, dlChunkSize: 0, quality: [91,92,93,94,95], opusEncoded: true, liveBuffer: 4900 } as downloadOptions;
            const optionsNormal = { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 } as downloadOptions;
            // Generate stream.
            stream = ytdl(currentSong.url, optionsNormal);
            break;
    }

    return { stream }
}

async function playManager(client: Client, guildId: string, serverQueue: any) {
    // Get connection, player and text channel id for that given guild.
    const connection = getVoiceConnection(guildId)!;
    const player = serverQueue.subscription.player;

    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;
    let currentSong: any;
    let subscription: PlayerSubscription;
    let resource: AudioResource;

    // -----------------------------------------------------
    // ---------------------- EVENTS -----------------------
    // -----------------------------------------------------

    player.on(AudioPlayerStatus.Playing, () => {
        serverQueue = serverQueues.get(guildId);
        currentSong = serverQueue.songQueue[0];

        songEmbed
            .setColor(config.embeds.main as ColorResolvable)
            .setTitle(currentSong.title)
            .setURL(currentSong.url)
            .setAuthor({ name: "Ahora Suena ♪", iconURL: config.playerIcons.playing })
            .setDescription(`\`[0:00 / ${currentSong.durationTimestamp}]\``)
            .setThumbnail(currentSong.thumbnail)
            .setFooter({ text: `Pedida por ${currentSong.requester.tag}`, iconURL: currentSong.requester.displayAvatarURL({ forceStatic: false }) })
        channel.send({ embeds: [songEmbed] });
    })

    player.on(AudioPlayerStatus.Idle, async () => {
        // Remove finished song from the queue.
        serverQueue = serverQueues.get(guildId);
        serverQueue.songQueue.shift();

        // Check if there is another song to play.
        if (serverQueue.songQueue.length >= 1) {
            // Generate stream.
            currentSong = serverQueue.songQueue[0];
            const { stream } = await getStream(currentSong);
            // Create the audio player.
            resource = createAudioResource(stream as any);
            player.play(resource);
        }
    })

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 1000),
                entersState(connection, VoiceConnectionStatus.Connecting, 1000)
            ])
        } catch (error) {
            player.stop();
            subscription.unsubscribe();
            serverQueues.delete(guildId);
            if (connection!.state.status !== 'destroyed') {
                connection!.destroy();
            }
            const disconnectedEmbed = new EmbedBuilder()
                .setColor(config.embeds.main as ColorResolvable)
                .setAuthor({ name: "Desconectada" })
                .setColor(config.embeds.defaultColor2 as ColorResolvable)
                .setDescription('Me he desconectado del canal de voz. Nos vemos!')

            channel.send({ embeds: [disconnectedEmbed] });
        }
    })

    //Log Errors.
    player.on('error', async (err: any) => {
        channel.send('Se produjo un error inesperado al reproducir esta pista. Pista saltada.');
        console.log(err);
        // Remove finished song from the queue.
        serverQueue = serverQueues.get(guildId);
        serverQueue.songQueue.shift();
        // Check if there is another song to play.
        if (serverQueue.songQueue.length >= 1) {
            // Generate stream.
            const { stream } = await getStream(currentSong);
            // Create the audio player.
            resource = createAudioResource(stream as any);
            player.play(resource);

        }
    })
}

async function getMetadata(request: string, type: string) {
    let title = null;
    let thumbnail = null;
    let url = null;
    let embedTitle = null;
    let embedDescription = null;
    let durationSec = null;
    let durationTimestamp = null;
    let playlist = null;
    switch (type) {
        case 'ytvideo':
            console.log(2);
            console.log(request);
            // Get video metadata.
            const info = await ytdl.getInfo(request);
            title = info.videoDetails.title;
            url = request;
            thumbnail = info.videoDetails.thumbnails[3].url;
            durationSec = parseInt(info.videoDetails.lengthSeconds);

            if (parseInt(info.videoDetails.lengthSeconds) < 3600) {
                durationTimestamp = new Date(durationSec * 1000).toISOString().slice(14, 19);
            } else {
                durationTimestamp = new Date(durationSec * 1000).toISOString().slice(11, 19);
            }

            embedTitle = 'Canción añadida a la cola ♪';
            embedDescription = `\`[0:00 / ${durationTimestamp}]\``;
            break;
        case 'ytplaylist':
            // Get playlist metadata.
            const playlistId = await ytpl.getPlaylistID(request);
            playlist = await ytpl(playlistId, { limit: Infinity });
            title = playlist.title;
            url = playlist.url;
            thumbnail = playlist.bestThumbnail.url;
            const itemCount = playlist.items.length;
            durationTimestamp = playlist.items[0].duration;

            embedTitle = 'En cola ♪'
            embedDescription = `¡La playlist 🎧 fue añadida con \`${itemCount}\` canciones!`;
            break;
    }

    return { title, url, durationTimestamp, thumbnail, embedTitle, embedDescription, playlist };
}
