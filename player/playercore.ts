// Handler for playing music in a voice channel.

import config from '../config.json';
import { Client, Message, EmbedBuilder, ColorResolvable, User, TextChannel } from 'discord.js';
import { createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, getVoiceConnection, PlayerSubscription } from '@discordjs/voice';
import ytdl, { downloadOptions } from 'ytdl-core';
import ytsr from 'ytsr';
import { client } from '../index';
import ytpl from 'ytpl';
import Song from '../Classes/Song';
import SongQueue from '../Classes/SongQueue';

const serverQueues = new Map();

// Functions.
async function eventManager(guildId: string, serverQueue: SongQueue) {
    // Get connection, player and text channel id for that given guild.
    const connection = getVoiceConnection(guildId)!;
    const player = serverQueue.subscription.player;

    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;

    player.on(AudioPlayerStatus.Playing, async () => {
        serverQueue = serverQueues.get(guildId);
        const SongQueue = await serverQueue.getSongQueue();

        SongQueue[0].displayCurrentSong(channel);
    })

    player.on(AudioPlayerStatus.Idle, async () => {
        // Remove finished song from the queue.
        serverQueue = serverQueues.get(guildId);
        const songQueue = await serverQueue.getSongQueue();

        // Loop the song.
        if (songQueue[0].loop === false) {
            songQueue.shift();
        }

        // Check if there is another song to play.
        if (songQueue.length >= 1) {
            // Generate stream.
            const stream = await getStream(songQueue[0]);
            // Create the audio player.
            let resource = createAudioResource(stream as any);
            player.play(resource);
        }
        serverQueue.updateSongQueue(songQueue);
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
            serverQueue.dropSongQueue();
            serverQueues.delete(guildId);
            if (connection!.state.status !== 'destroyed') {
                connection!.destroy();
            }
            const disconnectedEmbed = new EmbedBuilder()
                .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
                .setAuthor({ name: "Desconectada" })
                .setDescription('Me he desconectado del canal de voz. Nos vemos!')

            channel.send({ embeds: [disconnectedEmbed] });
        }
    })

    // In case the track can't be played or returns and error.
    player.on('error', async () => {
        channel.send('❌ Se produjo un error inesperado al reproducir esta canción. Pista saltada.');
        serverQueue = serverQueues.get(guildId);
        const songQueue = await serverQueue.getSongQueue();
        if (!serverQueue) return;

        // Remove song from the queue.
        songQueue.shift();

        // Check if there is another song to play.
        if (songQueue.length >= 1) {
            // Generate stream.
            const stream = await getStream(songQueue[0]);
            // Create the audio player.
            let resource = createAudioResource(stream as any);
            player.play(resource);
        }
        serverQueue.updateSongQueue(songQueue);
    })
}

// Gets audio stream depending on the source.
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

// Gets metadata for the song.
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

// gets metadata from search query.
async function getMetadataFromSearchQuery(query: string) {
    let title = null;
    let thumbnail = null;
    let url = null;
    let playlist = null;
    let durationTimestamp = null;

    const search = await ytsr(query, { limit: 3 }) as any;
    let item = 0;
    let song = search.items[item];

    while (search.items[item].type === 'playlist' || search.items[item].type === 'movie' && item < 2) {
        item++;
        song = search.items[item];
    }
    if (search.items.length < 1 || search.items[item].type === 'playlist' || search.items[item].type === 'movie') return;

    title = song.title;
    url = song.url;
    thumbnail = song.bestThumbnail.url;
    durationTimestamp = song.duration;

    return { title, url, durationTimestamp, thumbnail, playlist };
}

export default {
    // Plays the requested song in the designate voice channel.
    async play(client: Client, message: Message, song: string) {
        // find the source based on the users request (can be either a link or search query).
        let newSongQueue: Song[] = [];
        let metadata: { title: string | null, url: string | null, durationTimestamp: string | null, thumbnail: string | null, playlist: ytpl.Result | null } | undefined;
        const requester = message.member!.user;

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

        if (YTVideoRegex.test(song) || YTPlaylistRegex.test(song) || YTMixRegex.test(song)) {
            // Generate a queue if the link is a playlist.
            if (YTPlaylistRegex.test(song) || YTMixRegex.test(song)) {
                try {
                    metadata = await getMetadata(song, 'ytplaylist');
                    const playlist = metadata.playlist!;
                    for (let item = 0; item < playlist.items.length; item++) {
                        newSongQueue.push(new Song('youtube', playlist.items[item].title, playlist.items[item].url, playlist.items[item].duration, playlist.items[item].bestThumbnail.url, requester, false));
                    }
                } catch {
                    // Could not find the playlist (Mixes not yet supported).
                    metadata = await getMetadata(song, 'ytvideo');
                    newSongQueue.push(new Song('youtube', metadata.title, song, metadata.durationTimestamp, metadata.thumbnail, requester, false));
                }
            } else {
                metadata = await getMetadata(song, 'ytvideo');
                newSongQueue.push(new Song('youtube', metadata.title, song, metadata.durationTimestamp, metadata.thumbnail, requester, false));
            }
        } else if (spotifySongRegex.test(song)) {
            message.channel.send('Lo siento, pero todavia no soportamos spotify.');
            return;
        } else if (spotifyPlaylistRegex.test(song) || spotifyAlbumRegex.test(song)) {
            message.channel.send('Lo siento, pero todavia no soportamos spotify.');
            return;
        } else {
            metadata = await getMetadataFromSearchQuery(song);
            if (!metadata) {
                message.channel.send('No se han encontrado resultados. Prueba diferentes palabras clave o revisa el enlace ingresado.');
                return;
            }
            newSongQueue.push(new Song('youtube', metadata.title, song, metadata.durationTimestamp, metadata.thumbnail, requester, false));
        }

        // Check if a queue exists for that server. If not, then generate one.
        const guildId = message.guildId!;
        let serverQueue = serverQueues.get(guildId) as SongQueue;
        let songQueue = await serverQueue.getSongQueue();
        let subscription: PlayerSubscription;
        let currentSong = newSongQueue[0];
        if (!serverQueue) { // Plays audio onm the created voice connection.
            const connection = getVoiceConnection(guildId)!;
            const player = createAudioPlayer();
            subscription = connection.subscribe(player) as PlayerSubscription;

            serverQueue = new SongQueue(guildId, message.channelId, subscription);
            serverQueues.set(guildId, serverQueue);

            // Generate stream depending on the source.
            const stream = await getStream(currentSong);

            // Create the audio source and play it.
            let resource = createAudioResource(stream as any);
            player.play(resource);

            if (newSongQueue.length > 1) {
                const songEmbed = new EmbedBuilder()
                    .setColor(config.playerEmbeds.colors.queuedColor as ColorResolvable)
                    .setTitle(metadata.title)
                    .setURL(metadata.url)
                    .setAuthor({ name: 'En cola ♪' })
                    .setDescription(`¡La playlist 🎧 fue añadida con \`${newSongQueue.length}\` canciones!`)
                    .setThumbnail(metadata.thumbnail)
                    .setFooter({ text: `Pedida por ${newSongQueue[0].requester.tag}`, iconURL: newSongQueue[0].requester.avatar })
                message.channel.send({ embeds: [songEmbed] });
            }

            eventManager(guildId, serverQueue);
            return;
        } else if (songQueue.length < 1) { // bot is connected bot not playing audio.
            // Plays audio.
            subscription = serverQueue.subscription;
            const player = subscription.player;
            let currentSong = newSongQueue[0];
            const stream = await getStream(currentSong);
            let resource = createAudioResource(stream as any);
            player.play(resource);

            if (newSongQueue.length > 1) { // If it is a playlist.
                const songEmbed = new EmbedBuilder()
                    .setColor(config.playerEmbeds.colors.queuedColor as ColorResolvable)
                    .setTitle(metadata.title)
                    .setURL(metadata.url)
                    .setAuthor({ name: 'En cola ♪' })
                    .setDescription(`¡La playlist 🎧 fue añadida con \`${newSongQueue.length}\` canciones!`)
                    .setThumbnail(metadata.thumbnail)
                    .setFooter({ text: `Pedida por ${newSongQueue[0].requester.tag}`, iconURL: newSongQueue[0].requester.avatar })
                message.channel.send({ embeds: [songEmbed] });
            }
        } else { // Bot is connected and playing audio.
            if (newSongQueue.length > 1) {
                const songEmbed = new EmbedBuilder()
                    .setColor(config.playerEmbeds.colors.queuedColor as ColorResolvable)
                    .setTitle(metadata.title)
                    .setURL(metadata.url)
                    .setAuthor({ name: 'En cola ♪' })
                    .setDescription(`¡La playlist 🎧 fue añadida con \`${newSongQueue.length}\` canciones!`)
                    .setThumbnail(metadata.thumbnail)
                    .setFooter({ text: `Pedida por ${newSongQueue[0].requester.tag}`, iconURL: newSongQueue[0].requester.avatar })
                message.channel.send({ embeds: [songEmbed] });
            } else {
                currentSong.displayQueuedSong(message.channel as TextChannel);
            }
        }
        songQueue.push(...newSongQueue);
        await serverQueue.updateSongQueue(songQueue);
    },

    // Pauses the player for the selected guild.
    pause(guildId: string) {
        const serverQueue = serverQueues.get(guildId) as SongQueue;
        serverQueue.subscription.player.pause();
        return;
    },

    // Resumes playback for the selected guild.
    resume(guildId: string) {
        const serverQueue = serverQueues.get(guildId) as SongQueue;
        serverQueue.subscription.player.unpause();
        return;
    },

    // Skips a track for the selected guild.
    async skip(guildId: string) {
        const serverQueue = serverQueues.get(guildId) as SongQueue;
        const songQueue = await serverQueue.getSongQueue();
        songQueue[0].loop = false;
        serverQueue.updateSongQueue(songQueue);
        serverQueue.subscription.player.stop();
        return;
    },

    // Removes a selected song from the queue.
    async remove(guildId: string, index: number) {
        const serverQueue = serverQueues.get(guildId) as SongQueue;
        const songQueue = await serverQueue.getSongQueue();
        songQueue.splice(index, 1);
        serverQueue.updateSongQueue(songQueue);
        return;
    },

    // Loops the current song.
    async loop(guildId: string) {
        const serverQueue = serverQueues.get(guildId) as SongQueue;
        const songQueue = await serverQueue.getSongQueue();
        songQueue[0].loop = true;
        serverQueue.updateSongQueue(songQueue);
        return;
    },

    // Shuffles the queue for a particular guild.
    async shuffle(guildId: string) {
        const serverQueue = serverQueues.get(guildId) as SongQueue;
        const songQueue = await serverQueue.getSongQueue();
        const currentSong = songQueue[0];
        songQueue.shift();

        let currentIndex = songQueue.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [songQueue[currentIndex], songQueue[randomIndex]] = [songQueue[randomIndex], songQueue[currentIndex]];
        }
        songQueue.splice(0, 0, currentSong);

        const songEmbed = new EmbedBuilder()
            .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
            .setTitle(`La lista de canciones \`ha sido mezclada\`.`)
            .setFooter({ text: `Por ${songQueue[0].requester.tag}`, iconURL: songQueue[0].requester.avatar })
        const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;
        channel.send({ embeds: [songEmbed] });

        serverQueue.updateSongQueue(songQueue);
        return;
    },

    // Returns the song queue for that particular guild.
    async getServerQueue(guildId: string) {
        const serverQueue = serverQueues.get(guildId) as SongQueue;
        const queue = await serverQueue.getSongQueue() as Song[];
        return queue;
    }
}