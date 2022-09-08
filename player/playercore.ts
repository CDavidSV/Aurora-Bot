// Handler for playing music in a voice channel.

import config from '../config.json';
import { Message, EmbedBuilder, ColorResolvable, TextChannel, ButtonInteraction, InteractionCollector, CacheType, SelectMenuInteraction, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection, PlayerSubscription, NoSubscriberBehavior, VoiceConnectionStatus, entersState, joinVoiceChannel, DiscordGatewayAdapterCreator } from '@discordjs/voice';
import { client } from '../index';
import Song from './Classes/Song';
import SongQueue from './Classes/SongQueue';
import Metadata from './Classes/Metadata';
import { getStream } from './functions/getStream';
import { getMetadata } from './functions/getMetadata';
import { getMetadataFromSearchQuery } from './functions/getMetadataFromSearchQuery';

const serverQueues: Map<string, SongQueue> = new Map();

// Buttons.
const playerButtons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents([
        new ButtonBuilder()
            .setCustomId('stop_player')
            .setLabel('◼')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('pause_playback')
            .setLabel('❚❚')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('skip_song')
            .setLabel('▶❚')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('loop_song')
            .setLabel('↻')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId('show_queue')
            .setLabel('Queue')
            .setStyle(ButtonStyle.Secondary),
    ]);

// Event manager.
async function EventManager(guildId: string, serverQueue: SongQueue) {
    // Get connection, player and text channel id for that given guild.
    const connection = getVoiceConnection(guildId)!;
    const songQueue = await serverQueue.getSongQueue() as Song[];

    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;
    const songEmbed = songQueue[0].displayCurrentSong();

    const sentMessage = await channel.send({ embeds: [songEmbed], components: [playerButtons] });

    const collector = channel.createMessageComponentCollector();

    serverQueue.collector = collector;
    serverQueue.lastMessage = sentMessage;
    serverQueues.set(guildId, serverQueue);

    // Player events.
    serverQueue.player.on(AudioPlayerStatus.Idle, async () => {
        // Remove finished song from the queue.
        const serverQueue = serverQueues.get(guildId) as SongQueue;
        const songQueue = await serverQueue.getSongQueue() as Song[];

        // Loop the song.
        if (!serverQueue.loop) {
            serverQueue.lastMessage!.edit({ components: [] });

            songQueue.shift();
        }

        // Check if there is another song to play.
        if (songQueue.length >= 1) {
            // Generate stream.
            const stream = await getStream(songQueue[0]);

            // Create the audio player.
            let resource = createAudioResource(stream as any);
            serverQueue.player.play(resource);
            serverQueue.playing = true;

            if (!serverQueue.loop) {
                const songEmbed = songQueue[0].displayCurrentSong();

                const sentMessage = await channel.send({ embeds: [songEmbed], components: [playerButtons] });

                serverQueue.collector = collector;
                serverQueue.lastMessage = sentMessage;
                serverQueues.set(guildId, serverQueue);
            }
        } else {
            serverQueue.loop = false;
            serverQueue.playing = false;
            serverQueues.set(guildId, serverQueue);

            setTimeout(async () => {
                let queueSize = (await serverQueue.getSongQueue())!;
                if (!queueSize || queueSize.length < 1) {
                    connection.destroy();

                    serverQueue.collector!.stop();

                    serverQueue.player.removeAllListeners();
                    serverQueue.player.stop();
                    serverQueue.dropSongQueue();
                    serverQueues.delete(guildId);
                }
            }, 300000)
        }

        serverQueue.updateSongQueue(songQueue);
    });

    // In case the track can't be played or returns and error.
    serverQueue.player.on('error', async () => {
        channel.send('❌ Se produjo un error inesperado al reproducir esta canción. Pista saltada.');
        const serverQueue = serverQueues.get(guildId) as SongQueue;
        const songQueue = await serverQueue.getSongQueue() as Song[];
        if (!serverQueue) return;

        // Remove song from the queue.
        songQueue.shift();

        // Check if there is another song to play.
        if (songQueue.length >= 1) {
            // Generate stream.
            const stream = await getStream(songQueue[0]);

            serverQueue.lastMessage!.edit({ components: [] });

            // Create the audio resource.
            let resource = createAudioResource(stream as any);
            serverQueue.player.play(resource);
            serverQueue.playing = true;
            const songEmbed = songQueue[0].displayCurrentSong();

            const sentMessage = await channel.send({ embeds: [songEmbed], components: [playerButtons] });

            serverQueue.lastMessage = sentMessage;
            serverQueues.set(guildId, serverQueue);
        } else {
            serverQueue.playing = false;
            serverQueues.set(guildId, serverQueue);

            setTimeout(async () => {
                let queueSize = await serverQueue.getSongQueue() as Song[];
                if (!queueSize || queueSize.length < 1) {
                    connection.destroy();

                    serverQueue.collector!.stop();

                    serverQueue.player.removeAllListeners();
                    serverQueue.player.stop();
                    serverQueue.dropSongQueue();
                    serverQueues.delete(guildId);
                }
            }, 300000)
        }
    });

    // Collector Events.
    collector.on('collect', async (interaction: ButtonInteraction) => {
        if (!getVoiceConnection(guildId)) {
            interaction.reply({ content: 'No hay un reproductor activo en este servidor.', ephemeral: true });
            collector.stop();
            collector.removeAllListeners();
            return;
        }
        if (!interaction.guild!.members.cache.get(interaction.user.id)!.voice.channel) {
            interaction.reply({ content: `Necesitas primero estar dentro de un **canal de voz**`, ephemeral: true });
            return;
        }
        const updatedPlayerButtons = playerButtons;
        switch (interaction.customId) {
            case 'resume_playback':
                resume(guildId);
                updatedPlayerButtons.components[1].setCustomId('pause_playback').setLabel('❚❚');
                await interaction.update({ content: 'Resumed', components: [updatedPlayerButtons] }).catch(async () => {
                    await interaction.editReply({});
                });
                break;
            case 'pause_playback':
                pause(guildId);
                updatedPlayerButtons.components[1].setCustomId('resume_playback').setLabel('▶');
                await interaction.update({ content: 'Paused', components: [updatedPlayerButtons] }).catch(async () => {
                    await interaction.editReply({});
                });
                break;
            case 'skip_song':
                skip(guildId);
                await interaction.update({ content: 'Skipped' }).catch(async () => {
                    await interaction.editReply({});
                });
                break;
            case 'loop_song':
                loop(guildId);
                await interaction.update({ content: 'Loop activated' }).catch(async () => {
                    await interaction.editReply({});
                });
                break;
            case 'show_queue':
                await interaction.update({}).catch(async () => {
                    await interaction.editReply({});
                });
                break;
            case 'stop_player':
                stop(guildId);
                collector.stop();
                await interaction.update({ content: 'stopped' }).catch(async () => {
                    await interaction.editReply({});
                });
                break;
        }
    });

    collector.on('end', () => {
        const serverQueue = serverQueues.get(guildId);
        serverQueue!.lastMessage!.edit({ components: [] });

        collector.removeAllListeners();
    });

    // Connection events.

    // When the bot disconnects or is kicked from a voice channel.
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        const serverQueue = serverQueues.get(guildId) as SongQueue;
        const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;

        serverQueue.lastMessage!.edit({ components: [] });

        try {
            await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 1000),
                entersState(connection, VoiceConnectionStatus.Connecting, 1000)
            ])
            serverQueue.lastMessage!.edit({ components: [playerButtons] });
        } catch {
            const serverQueue = serverQueues.get(guildId) as SongQueue;

            if (connection.state.status !== 'destroyed') {
                connection.destroy();
            }

            collector.stop();

            serverQueue.player.removeAllListeners();
            serverQueue.player.stop();

            serverQueue.dropSongQueue();
            serverQueues.delete(guildId);

            const disconnectedEmbed = new EmbedBuilder()
                .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
                .setAuthor({ name: "Desconectada" })
                .setDescription('Me he desconectado del canal de voz. Nos vemos!')
            channel.send({ embeds: [disconnectedEmbed] });
        }
    });
}

// Player functions.

// Plays the requested song in the designate voice channel.
async function play(message: Message, song: string) {
    let newSongQueue: Song[] = [];
    let metadata: Metadata | undefined;

    const tag = message.member!.user.tag;
    const avatar = message.member!.user.displayAvatarURL({ forceStatic: false })
    const requesterObj: { tag: string, avatar: string } = { tag, avatar };

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

    // Join Voice Channel.
    let connection = getVoiceConnection(message.guildId!);
    if (!connection) {
        // Join voice channel.
        connection = joinVoiceChannel({
            channelId: message.member!.voice.channelId!,
            guildId: message.guildId!,
            adapterCreator: message.guild!.voiceAdapterCreator as DiscordGatewayAdapterCreator
        })
    }

    // find the source based on the users request (can be either a link or search query).
    if (YTVideoRegex.test(song) || YTPlaylistRegex.test(song) || YTMixRegex.test(song)) {
        // Generate a queue if the link is a playlist.
        if (YTPlaylistRegex.test(song) || YTMixRegex.test(song)) {
            try {
                metadata = await getMetadata(song, 'ytplaylist');
                if (!metadata) {
                    message.channel.send('❌ No se han encontrado resultados. Esto puede deberse a que la canción **es para usuarios Premium o es privada.**')
                    return;
                }
                const playlist = metadata.playlist!;
                for (let item = 0; item < playlist.items.length; item++) {
                    newSongQueue.push(new Song('youtube', playlist.items[item].title, playlist.items[item].url, playlist.items[item].duration, playlist.items[item].bestThumbnail.url, requesterObj));
                }
            } catch {
                // Could not find the playlist (Mixes not yet supported).
                metadata = await getMetadata(song, 'ytvideo');
                if (!metadata) {
                    message.channel.send('❌ No se han encontrado resultados. Esto puede deberse a que la canción **es para usuarios Premium o es privada**.')
                    return;
                }
                newSongQueue.push(new Song('youtube', metadata.title, song, metadata.durationTimestamp, metadata.thumbnail, requesterObj));
            }
        } else {
            metadata = await getMetadata(song, 'ytvideo');
            if (!metadata) {
                message.channel.send('❌ No se han encontrado resultados. Esto puede deberse a que la canción **es para usuarios Premium o es privada**.')
                return;
            }
            newSongQueue.push(new Song('youtube', metadata.title, song, metadata.durationTimestamp, metadata.thumbnail, requesterObj));
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
            message.channel.send('❌ No se han encontrado resultados. Prueba diferentes **palabras clave**.');
            return;
        }
        newSongQueue.push(new Song('youtube', metadata.title, metadata.url, metadata.durationTimestamp, metadata.thumbnail, requesterObj));
    }

    // Check if a queue exists for that server. If not, then generate one.
    const guildId = message.guildId!;
    let serverQueue = serverQueues.get(guildId) as SongQueue;
    let currentSong = newSongQueue[0];
    if (!serverQueue) { // Plays audio onm the created voice connection.
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
            },
        });
        connection.subscribe(player) as PlayerSubscription;

        serverQueue = new SongQueue(guildId, message.channelId, player, true, false);
        serverQueues.set(guildId, serverQueue);

        // Generate stream depending on the source.
        const stream = await getStream(currentSong);

        // Create the audio source and play it.
        let resource = createAudioResource(stream as any);
        player.play(resource);

        // Create a document in the database to save the queue.
        await serverQueue.updateSongQueue(newSongQueue);

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

        EventManager(guildId, serverQueue);
        return;
    } else if (!serverQueue.playing) { // bot is connected bot not playing audio.
        // Plays audio.
        const player = serverQueue.player;
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
        const songEmbed = newSongQueue[0].displayCurrentSong();

        const sentMessage = await message.channel.send({ embeds: [songEmbed], components: [playerButtons] });

        serverQueue.playing = true;
        serverQueue.lastMessage = sentMessage;
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
            const songEmbed = newSongQueue[0].displayQueuedSong();
            message.channel.send({ embeds: [songEmbed] });
        }
    }
    const songQueue = await serverQueue.getSongQueue() as Song[];
    songQueue.push(...newSongQueue);
    await serverQueue.updateSongQueue(songQueue);
    serverQueues.set(guildId, serverQueue)
}

// Pauses the player for the selected guild.
function pause(guildId: string) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    serverQueues.set(guildId, serverQueue);

    serverQueue.player.pause();
    return;
}

// Resumes playback for the selected guild.
function resume(guildId: string) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    serverQueue.player.unpause();
    return;
}

// Skips a track for the selected guild.
function skip(guildId: string) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;

    serverQueue.loop = false;
    serverQueue.player.stop();

    serverQueues.set(guildId, serverQueue);
    return;
}

// Removes a selected song from the queue.
async function remove(guildId: string, index: number) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    const songQueue = await serverQueue.getSongQueue() as Song[];
    songQueue.splice(index, 1);
    serverQueue.updateSongQueue(songQueue);
    return;
}

// Loops the current song.
async function loop(guildId: string) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    const songQueue = await serverQueue.getSongQueue() as Song[];

    if (serverQueue.loop) {
        serverQueue.loop = false;
        const songEmbed = new EmbedBuilder()
            .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
            .setDescription(`Repetición **ha sido desactivada**.`)
            .setFooter({ text: `Pedido por ${songQueue[0].requester.tag}`, iconURL: songQueue[0].requester.avatar })
        const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;
        channel.send({ embeds: [songEmbed] });
    } else {
        serverQueue.loop = true;
        const songEmbed = new EmbedBuilder()
            .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
            .setDescription(`Repetición **ha sido activada**.`)
            .setFooter({ text: `Pedido por ${songQueue[0].requester.tag}`, iconURL: songQueue[0].requester.avatar })
        const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;
        channel.send({ embeds: [songEmbed] });
    }
    serverQueues.set(guildId, serverQueue);

    return;
}

// Shuffles the queue for a particular guild.
async function shuffle(guildId: string) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    const songQueue = await serverQueue.getSongQueue() as Song[];
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
        .setDescription(`La lista de canciones **ha sido mezclada.♪**`)
        .setFooter({ text: `Pedido por ${songQueue[0].requester.tag}`, iconURL: songQueue[0].requester.avatar })
    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;
    channel.send({ embeds: [songEmbed] });

    serverQueue.updateSongQueue(songQueue!);
    return;
}

// Replays the current song.
function replay(guildId: string) {

}

// Stops the player and disconnects from the voice channel.
function stop(guildId: string) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    const connection = getVoiceConnection(guildId)!;
    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;

    if (serverQueue.player.state.status = AudioPlayerStatus.Paused) {
        serverQueue.player.unpause();
    }
    connection!.destroy();
    serverQueue.player.removeAllListeners();
    serverQueue.player.stop();

    serverQueue.collector!.stop();
    serverQueue.dropSongQueue();
    serverQueues.delete(guildId);

    const disconnectedEmbed = new EmbedBuilder()
        .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
        .setAuthor({ name: "Desconectada" })
        .setDescription('Me he desconectado del canal de voz. Nos vemos!')
    channel.send({ embeds: [disconnectedEmbed] });
    return;
}

// Clear the queue.
function clear(guildId: string) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    serverQueue.deleteQueue();
    return;
}

// Returns the queue for that particular guild.
async function getSongQueue(guildId: string) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    const queue = await serverQueue.getSongQueue() as Song[];
    return queue;
}

// Returns the serverQueues map containing objects for all voice connections.
function getServerQueues() {
    return serverQueues;
}

// Export all player functions.
export default {
    play,
    pause,
    resume,
    skip,
    remove,
    loop,
    shuffle,
    replay,
    stop,
    clear,
    getSongQueue,
    getServerQueues
}