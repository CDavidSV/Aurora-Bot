// Handler for playing music in a voice channel.

import config from '../../config.json';
import { Client, Message, EmbedBuilder, ColorResolvable, User, TextChannel } from 'discord.js';
import { createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, getVoiceConnection, AudioPlayer, PlayerSubscription } from '@discordjs/voice';
import ytdl, { downloadOptions } from 'ytdl-core';
import ytsr from 'ytsr';
import ytpl from 'ytpl';

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
        let songQueue: { type: string, url: string, requester: User }[] = [];
        let metadata: { title: any, url: any, durationTimestamp: string | undefined, thumbnail: any, embedTitle: string | undefined, embedDescription: string | undefined };
        const requester = message.member!.user;

        if (YTVideoRegex.test(song) || YTPlaylistRegex.test(song) || YTMixRegex.test(song)) {
            // Generate a queue if the link is a playlist.
            if (YTPlaylistRegex.test(song) || YTMixRegex.test(song)) {
                try {
                    const playlistId = await ytpl.getPlaylistID(song);
                    const playlist = await ytpl(playlistId, { limit: Infinity });
                    for (let item = 0; item < playlist.items.length; item++) {
                        songQueue.push({ type: 'youtube', url: playlist.items[item].url, requester: requester });
                    }
                    metadata = await getMetadata(playlist, 'ytplaylist');
                } catch {
                    // Could not find the playlist (Mixes not yet supported).
                    songQueue.push({ type: 'youtube', url: song, requester: requester });
                    metadata = await getMetadata(song, 'ytvideo');
                }
            } else {
                songQueue.push({ type: 'youtube', url: song, requester: requester });
                metadata = await getMetadata(song, 'ytvideo');
            }
        } else if (spotifySongRegex.test(song)) {
            message.channel.send('Lo siento pero todavia no soportamos spotify.');
            return;
        } else if (spotifyPlaylistRegex.test(song) || spotifyAlbumRegex.test(song)) {
            message.channel.send('Lo siento pero todavia no soportamos spotify.');
            return;
        } else {
            const search = await ytsr(song, { limit: 1 }) as any;
            if (search.items.length < 1) {
                message.channel.send('No se han encontrado resultados. Prueba diferentes palabras clave o revisa el enlace ingresado.');
                return;
            }
            song = search.items[0].url;
            songQueue.push({ type: 'youtube', url: song, requester: requester });
            metadata = await getMetadata(song, 'ytvideo');
        }

        // Check if a queue exists for that server. If not, then generate one.
        let player: AudioPlayer;
        const guildId = message.guildId!;
        let serverQueue = serverQueues.get(guildId);
        if (!serverQueue) {
            player = createAudioPlayer();
            const queueConstructor = {
                guildId: guildId,
                textChannelId: message.channelId,
                player: player,
                songQueue: songQueue as { url: string, requester: User }[]
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
            playManager(client, guildId, serverQueue, metadata);

        } else if (serverQueue.songQueue.length < 1) { // Queue is empty but the bot is still in a voice channel.
            serverQueue.songQueue.push(...songQueue);
            playManager(client, guildId, serverQueue, metadata);
        } else { // A song is currently playing, so add the requested one in queue.
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
        serverQueue.player.pause();
        return;
    },

    // Resumes playback for the selected guild.
    resume(guildId: string) {
        const serverQueue = serverQueues.get(guildId);
        serverQueue.player.unpause();
        return;
    },

    // Skips a track for the selected guild.
    skip(guildId: string) {
        const serverQueue = serverQueues.get(guildId);
        serverQueue.player.stop();
        return;
    },

    remove(guildId: string, index: number) {
        const serverQueue = serverQueues.get(guildId)
        const songQueue = serverQueue.songQueue.splice(index, 1);

        const queueConstructor = {
            guildId: guildId,
            textChannelId: serverQueue.channelId,
            player: serverQueue.player,
            songQueue: songQueue as { url: string, requester: User }[]
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

async function playManager(client: Client, guildId: string, serverQueue: any, metadata: { title: any, url: any, durationTimestamp: string | undefined, thumbnail: any, embedTitle: string | undefined, embedDescription: string | undefined }) {

    // Get connection, player and text channel id for that given guild.
    const connection = getVoiceConnection(guildId)!;
    const player = serverQueue.player;
    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;

    let currentSong = serverQueue.songQueue[0];
    let subscription: PlayerSubscription;

    // Generate stream depending on the source.
    const { stream } = await getStream(currentSong);

    // Create the audio source and add the subscription.
    let resource = createAudioResource(stream as any);
    serverQueue.player.play(resource);
    subscription = connection.subscribe(serverQueue.player) as PlayerSubscription;

    songEmbed
        .setColor(config.embeds.main as ColorResolvable)
        .setTitle(metadata.title)
        .setURL(currentSong.url)
        .setAuthor({ name: "Ahora Suena ♪", iconURL: 'https://media1.tenor.com/images/6bccf62f1691173159c35373068551c2/tenor.gif?itemid=26309669' })
        .setDescription(`\`[0:00 / ${metadata.durationTimestamp}]\``)
        .setThumbnail(metadata.thumbnail)
        .setFooter({ text: `Pedida por ${currentSong.requester.tag}`, iconURL: currentSong.requester.displayAvatarURL({ forceStatic: false }) })
    channel.send({ embeds: [songEmbed] });


    // -----------------------------------------------------
    // ---------------------- EVENTS -----------------------
    // -----------------------------------------------------

    player.on(AudioPlayerStatus.Idle, async () => {
        // console.log('Song ended');

        // Song ended (Stop player and unsubscribe).
        player.stop();
        subscription.unsubscribe();

        // Remove finished song from the queue.
        serverQueue.songQueue.shift();

        // Check if there is another song to play.
        if (serverQueue.songQueue.length >= 1) {
            // Generate stream.
            currentSong = serverQueue.songQueue[0];
            const { stream } = await getStream(currentSong);
            const metadata = await getMetadata(currentSong.url, 'ytvideo');
            // Create the audio player.
            resource = createAudioResource(stream as any);
            serverQueue.player.play(resource);

            // Subscribe to the player.
            subscription = connection.subscribe(serverQueue.player) as PlayerSubscription;

            songEmbed
                .setColor(config.embeds.main as ColorResolvable)
                .setTitle(metadata.title)
                .setURL(currentSong.url)
                .setAuthor({ name: "Ahora Suena ♪", iconURL: 'https://media1.tenor.com/images/6bccf62f1691173159c35373068551c2/tenor.gif?itemid=26309669' })
                .setDescription(`\`[0:00 / ${metadata.durationTimestamp}]\``)
                .setThumbnail(metadata.thumbnail)
                .setFooter({ text: `Pedida por ${currentSong.requester.tag}`, iconURL: currentSong.requester.displayAvatarURL({ forceStatic: false }) })
            channel.send({ embeds: [songEmbed] });

        } else {
            serverQueue.songQueue = [];
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
    player.on('error', async () => {
        serverQueue.textChannel.send('Se produjo un error inesperado al reproducir esta pista. Pista saltada.');
        // Check if there is another song to play.
        if (serverQueue.songQueue.length >= 1) {
            // Generate stream.
            const { stream } = await getStream(currentSong);
            const metadata = await getMetadata(currentSong.url, 'ytvideo');
            // Create the audio player.
            resource = createAudioResource(stream as any);
            serverQueue.player.play(resource);

            // Subscribe to the player.
            subscription = connection!.subscribe(serverQueue.player) as PlayerSubscription;

            songEmbed
                .setColor(config.embeds.main as ColorResolvable)
                .setTitle(metadata.title)
                .setURL(currentSong.url)
                .setAuthor({ name: "Ahora Suena ♪", iconURL: 'https://media1.tenor.com/images/6bccf62f1691173159c35373068551c2/tenor.gif?itemid=26309669' })
                .setDescription(`\`[0:00 / ${metadata.durationTimestamp}]\``)
                .setThumbnail(metadata.thumbnail)
                .setFooter({ text: `Pedida por ${currentSong.requester.tag}`, iconURL: currentSong.requester.displayAvatarURL({ forceStatic: false }) })
            channel.send({ embeds: [songEmbed] });

        } else {
            serverQueue.songQueue = [];
        }
    })
}

async function getMetadata(request: any, type: string) {
    let title;
    let thumbnail;
    let url;
    let embedTitle;
    let embedDescription;
    let durationTimestamp;
    switch (type.toLocaleLowerCase()) {
        case 'ytvideo':
            // Get video metadata.
            const info = await ytdl.getInfo(request);
            title = info.videoDetails.title;
            url = request;
            thumbnail = info.videoDetails.thumbnails[3].url;
            const durationSec = parseInt(info.videoDetails.lengthSeconds);

            if (durationSec < 3600) {
                durationTimestamp = new Date(durationSec * 1000).toISOString().slice(14, 19);
            } else {
                durationTimestamp = new Date(durationSec * 1000).toISOString().slice(11, 19);
            }

            embedTitle = 'Canción añadida a la cola ♪';
            embedDescription = `\`[0:00 / ${durationTimestamp}]\``;
            break;
        case 'ytplaylist':
            // Get playlist metadata.
            title = request.title;
            url = request.url;
            thumbnail = request.bestThumbnail.url;
            const itemCount = request.items.length;

            embedTitle = 'En cola ♪'
            embedDescription = `¡La playlist 🎧 fue añadida con \`${itemCount}\` canciones!`;
            break;
    }

    return { title, url, durationTimestamp, thumbnail, embedTitle, embedDescription };
}
