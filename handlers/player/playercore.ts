// Handler for playing music in a voice channel.

import config from '../../config.json';
import { Client, Message, EmbedBuilder, ColorResolvable, User, TextChannel } from 'discord.js';
import { createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, getVoiceConnection, PlayerSubscription } from '@discordjs/voice';
import ytdl, { downloadOptions } from 'ytdl-core';
import ytsr from 'ytsr';
import ytpl from 'ytpl';

// serverQueues{guildId, queueConstructor{}}
const serverQueues = new Map();

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
        let newSongQueue: { type: string, title: string | null, url: string | null, durationTimestamp: string | null, thumbnail: string | null, requester: User }[] = [];
        let metadata: { title: string | null, url: string | null, durationTimestamp: string | null, thumbnail: string | null, playlist: ytpl.Result | null };
        const requester = message.member!.user;

        if (YTVideoRegex.test(song) || YTPlaylistRegex.test(song) || YTMixRegex.test(song)) {
            // Generate a queue if the link is a playlist.
            if (YTPlaylistRegex.test(song) || YTMixRegex.test(song)) {
                try {
                    metadata = await getMetadata(song, 'ytplaylist');
                    const playlist = metadata.playlist!;
                    for (let item = 0; item < playlist.items.length; item++) {
                        newSongQueue.push({ type: 'youtube', title: playlist.items[item].title, url: playlist.items[item].url, durationTimestamp: playlist.items[item].duration, thumbnail: playlist.items[item].bestThumbnail.url, requester: requester });
                    }
                } catch {
                    // Could not find the playlist (Mixes not yet supported).
                    metadata = await getMetadata(song, 'ytvideo');
                    newSongQueue.push({ type: 'youtube', title: metadata.title, url: song, durationTimestamp: metadata.durationTimestamp, thumbnail: metadata.thumbnail, requester: requester });
                }
            } else {
                metadata = await getMetadata(song, 'ytvideo');
                newSongQueue.push({ type: 'youtube', title: metadata.title, url: song, durationTimestamp: metadata.durationTimestamp, thumbnail: metadata.thumbnail, requester: requester });
            }
        } else if (spotifySongRegex.test(song)) {
            message.channel.send('Lo siento, pero todavia no soportamos spotify.');
            return;
        } else if (spotifyPlaylistRegex.test(song) || spotifyAlbumRegex.test(song)) {
            message.channel.send('Lo siento, pero todavia no soportamos spotify.');
            return;
        } else {
            const search = await ytsr(song, { limit: 3 }) as any;
            let item = 0;
            song = search.items[item].url;
            while (search.items[item].type === 'playlist' || search.items[item].type === 'movie' && item < 2) {
                item++;
                song = search.items[item].url;
            }
            if (search.items.length < 1 || search.items[item].type === 'playlist' || search.items[item].type === 'movie') {
                message.channel.send('No se han encontrado resultados. Prueba diferentes palabras clave o revisa el enlace ingresado.');
                return;
            }
            metadata = await getMetadata(song, 'ytvideo');
            newSongQueue.push({ type: 'youtube', title: metadata.title, url: song, durationTimestamp: metadata.durationTimestamp, thumbnail: metadata.thumbnail, requester: requester });
        }

        // Check if a queue exists for that server. If not, then generate one.
        const guildId = message.guildId!;
        let serverQueue = serverQueues.get(guildId);
        let subscription: PlayerSubscription;
        if (!serverQueue) {
            const connection = getVoiceConnection(guildId)!;
            const player = createAudioPlayer();
            subscription = connection.subscribe(player) as PlayerSubscription;

            const queueConstructor = {
                guildId: guildId,
                textChannelId: message.channelId,
                subscription: subscription,
                songQueue: newSongQueue as { type: string, title: string | null, url: string | null; durationTimestamp: string | null; thumbnail: string | null, requester: User }[]
            }
            serverQueues.set(guildId, queueConstructor);

            // Generate stream depending on the source.
            let currentSong = newSongQueue[0];
            const stream = await getStream(currentSong);
            // Create the audio source and play it.
            let resource = createAudioResource(stream as any);
            player.play(resource);
            eventManager(client, guildId, queueConstructor);
            return;
        } else { // Add the requested song or playlist in queue.
            subscription = serverQueue.subscription;
            if (serverQueue.songQueue.length < 1) {
                const player = subscription.player;
                let currentSong = newSongQueue[0];
                const stream = await getStream(currentSong);
                let resource = createAudioResource(stream as any);
                serverQueue.songQueue.push(...newSongQueue);
                player.play(resource);
            } else if (newSongQueue.length === 1) {
                const songEmbed = new EmbedBuilder()
                    .setColor(config.embeds.defaultColor2 as ColorResolvable)
                    .setTitle(metadata.title)
                    .setURL(metadata.url)
                    .setAuthor({ name: 'Canción añadida a la cola ♪' })
                    .setThumbnail(metadata.thumbnail)
                    .setFooter({ text: `Pedida por ${newSongQueue[0].requester.tag}`, iconURL: newSongQueue[0].requester.displayAvatarURL({ forceStatic: false }) })
                message.channel.send({ embeds: [songEmbed] });
                serverQueue.songQueue.push(...newSongQueue);
            } else {
                const songEmbed = new EmbedBuilder()
                    .setColor(config.embeds.defaultColor2 as ColorResolvable)
                    .setTitle(metadata.title)
                    .setURL(metadata.url)
                    .setAuthor({ name: 'En cola ♪' })
                    .setDescription(`¡La playlist 🎧 fue añadida con \`${newSongQueue.length}\` canciones!`)
                    .setThumbnail(metadata.thumbnail)
                    .setFooter({ text: `Pedida por ${newSongQueue[0].requester.tag}`, iconURL: newSongQueue[0].requester.displayAvatarURL({ forceStatic: false }) })
                message.channel.send({ embeds: [songEmbed] });
                serverQueue.songQueue.push(...newSongQueue);
            }
        }
        serverQueues.set(guildId, serverQueue);
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
        serverQueue.songQueue.splice(index, 1);
        serverQueues.set(guildId, serverQueue);
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
    return stream
}

async function eventManager(client: Client, guildId: string, serverQueue: any) {
    // Get connection, player and text channel id for that given guild.
    const connection = getVoiceConnection(guildId)!;
    const player = serverQueue.subscription.player;

    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;

    // -----------------------------------------------------
    // ---------------------- EVENTS -----------------------
    // -----------------------------------------------------

    player.on(AudioPlayerStatus.Playing, () => {
        serverQueue = serverQueues.get(guildId);
        let currentSong = serverQueue.songQueue[0];

        const songEmbed = new EmbedBuilder()
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
            let currentSong = serverQueue.songQueue[0];
            const stream = await getStream(currentSong);
            // Create the audio player.
            let resource = createAudioResource(stream as any);
            player.play(resource);
        }

        serverQueues.set(guildId, serverQueue);
    })

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        serverQueue = serverQueues.get(guildId);
        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 1000),
                entersState(connection, VoiceConnectionStatus.Connecting, 1000)
            ])
        } catch (error) {
            player.stop();
            serverQueue.subscription.unsubscribe();
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

    // In case the track can't be played or returns and error.
    player.on('error', async (err: any) => {
        channel.send('Se produjo un error inesperado al reproducir esta canción. Pista saltada.');
        // Remove song from the queue.
        serverQueue = serverQueues.get(guildId);
        serverQueue.songQueue.shift();

        // Check if there is another song to play.
        if (serverQueue.songQueue.length >= 1) {
            // Generate stream.
            let currentSong = serverQueue.songQueue[0];
            const stream = await getStream(currentSong);
            // Create the audio player.
            let resource = createAudioResource(stream as any);
            player.play(resource);
        }
    })
}

async function getMetadata(request: string, type: string) {
    let title = null;
    let thumbnail = null;
    let url = null;
    let durationSec = null;
    let durationTimestamp = null;
    let playlist = null;
    switch (type) {
        case 'ytvideo':
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
            break;
        case 'ytplaylist':
            // Get playlist metadata.
            const playlistId = await ytpl.getPlaylistID(request);
            playlist = await ytpl(playlistId, { limit: Infinity });
            title = playlist.title;
            url = playlist.url;
            thumbnail = playlist.bestThumbnail.url;
            durationTimestamp = playlist.items[0].duration;
            break;
    }
    return { title, url, durationTimestamp, thumbnail, playlist };
}