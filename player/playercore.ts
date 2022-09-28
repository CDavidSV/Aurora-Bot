// Handler for playing music in a voice channel.
import config from '../config.json';
import { Message, EmbedBuilder, ColorResolvable, TextChannel, ButtonInteraction, ButtonBuilder, ActionRowBuilder, ButtonStyle, GuildMember } from 'discord.js';
import { createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection, PlayerSubscription, NoSubscriberBehavior, VoiceConnectionStatus, entersState, joinVoiceChannel, DiscordGatewayAdapterCreator } from '@discordjs/voice';
import { client } from '../index';
import Song from './Classes/Song';
import SongQueue from './Classes/SongQueue';
import SongMetadata from './Classes/SongMetadata';
import { getSongMetadata } from './functions/getSongMetadata';
import { getMetadataFromSearchQuery } from './functions/getMetadataFromSearchQuery';
import { progressBar } from './functions/progressbar';
import { getPlaylistMetadata } from './functions/getPlaylistMetadata';
import PlaylistMetadata from './Classes/PlaylistMetadata';

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
    // Get connection, player and text channel for that given guild.
    const connection = getVoiceConnection(guildId)!;
    const songQueue = await serverQueue.getSongQueue() as Song[];
    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;

    const songEmbed = songQueue[0].displayCurrentSong();
    const sentMessage = await channel.send({ embeds: [songEmbed], components: [playerButtons] });
    const collector = channel.createMessageComponentCollector();

    serverQueue.collector = collector;
    serverQueue.lastMessage = sentMessage;
    serverQueue.startTimeInSec = Math.round(Date.now() / 1000);
    serverQueues.set(guildId, serverQueue);

    // Player events.
    serverQueue.player.on(AudioPlayerStatus.Idle, async () => {
        const serverQueue = serverQueues.get(guildId) as SongQueue;
        const songQueue = await serverQueue.getSongQueue() as Song[];
        let currentSong: Song;

        serverQueue.lastMessage!.edit({ components: [] });

        // Remove finished song from the queue.
        if(!serverQueue.loop && songQueue.length >= 1) {
            songQueue.shift();
            const songEmbed = songQueue[0].displayCurrentSong();
            playerButtons.components[1].setCustomId('pause_playback').setLabel('❚❚').setStyle(ButtonStyle.Secondary);
            const sentMessage = await channel.send({ embeds: [songEmbed], components: [playerButtons] });

            serverQueue.lastMessage = sentMessage;
        }

        // Check if there is another song to play.
        if (songQueue.length >= 1) { 
            currentSong = songQueue[0] as Song;

            // Generate stream.
            let stream: any;
            if(serverQueue.bassBoost && serverQueue.nightCore) {
                stream = currentSong.getStream('nightcore-bassboost');
            } else if (serverQueue.bassBoost) {
                stream = currentSong.getStream('bassboost');
            } else if (serverQueue.nightCore) {
                stream = currentSong.getStream('nightcore');
            } else {
                stream = currentSong.getStream();
            }

            // Create the audio player.
            let resource = createAudioResource(stream);
            serverQueue.player.play(resource);
            serverQueue.playing = true;
            serverQueue.startTimeInSec = Math.round(Date.now() / 1000);
        } else {
            serverQueue.loop = false;
            serverQueue.playing = false;

            setTimeout(async () => {
                if (songQueue.length < 1 && connection.state.status !== 'destroyed') {
                    connection.destroy();

                    collector.stop();

                    serverQueue.player.removeAllListeners();
                    serverQueue.player.stop();
                    serverQueue.dropSongQueue();
                    serverQueues.delete(guildId);
                }
            }, 300000)
        }
        serverQueues.set(guildId, serverQueue);
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
        const currentSong = songQueue[0] as Song;

        // Check if there is another song to play.
        if (songQueue.length >= 1) {
            // Generate stream.
            let stream: any;
            if(serverQueue.bassBoost && serverQueue.nightCore) {
                stream = currentSong.getStream('nightcore-bassboost');
            } else if (serverQueue.bassBoost) {
                stream = currentSong.getStream('bassboost');
            } else if (serverQueue.nightCore) {
                stream = currentSong.getStream('nightcore');
            } else {
                stream = currentSong.getStream();
            }

            serverQueue.lastMessage!.edit({ components: [] });

            // Create the audio resource.
            let resource = createAudioResource(stream as any);
            serverQueue.player.play(resource);
            serverQueue.playing = true;
            const songEmbed = songQueue[0].displayCurrentSong();

            const sentMessage = await channel.send({ embeds: [songEmbed], components: [playerButtons] });

            serverQueue.lastMessage = sentMessage;
            serverQueue.startTimeInSec = Math.round(Date.now() / 1000);
            serverQueues.set(guildId, serverQueue);
        } else {
            serverQueue.playing = false;
            serverQueues.set(guildId, serverQueue);

            setTimeout(async () => {
                if (songQueue.length < 1 && connection.state.status !== 'destroyed') {
                    connection.destroy();

                    collector.stop();

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
        const member = interaction.guild!.members.cache.get(interaction.user.id)!;
        if (!member.voice.channel) {
            interaction.reply({ content: `Necesitas primero estar dentro de un **canal de voz**.`, ephemeral: true });
            return;
        }
        if (interaction.guild!.members.me!.voice.channel && member!.voice.channelId != interaction.guild!.members.me!.voice.channelId) {
            interaction.reply({content: 'Tienes que estar en el **mismo canal de voz**.', ephemeral: true});
            return;
        }
        switch (interaction.customId) {
            case 'resume_playback':
                interaction.deferUpdate();
                resume(guildId, member);
                break;
            case 'pause_playback':
                interaction.deferUpdate();
                pause(guildId, member);        
                break;
            case 'skip_song':
                interaction.deferUpdate();
                skip(guildId, member);
                break;
            case 'loop_song':
                interaction.deferUpdate();
                loop(guildId, member);
                break;
            case 'show_queue':
                interaction.deferUpdate();
                break;
            case 'stop_player':
                stop(guildId, member);
                interaction.deferUpdate();
                break;
        }
    });

    collector.on('end', async () => {
        const serverQueue = serverQueues.get(guildId);
        await serverQueue!.lastMessage!.edit({ components: [] });

        collector.removeAllListeners();
    });

    // Connection events.

    // When the bot disconnects or is kicked from a voice channel.
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        const serverQueue = serverQueues.get(guildId) as SongQueue;
        const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;

        playerButtons.components[1].setCustomId('pause_playback').setLabel('❚❚').setStyle(ButtonStyle.Secondary);
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
    let metadata: SongMetadata | PlaylistMetadata | undefined;

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
                metadata = await getPlaylistMetadata(song);
                if (!metadata) {
                    message.channel.send('❌ No se han encontrado resultados. Esto puede deberse a que la canción **es para usuarios Premium o es privada.**')
                    return;
                }
                const playlist = metadata.playlist!;
                for (let item = 0; item < playlist.items.length; item++) {
                    newSongQueue.push(new Song('ytvideo', playlist.items[item].title, playlist.items[item].url, playlist.items[item].duration!, playlist.items[item].durationSec!, playlist.items[item].bestThumbnail.url!, requesterObj));
                }
            } catch {
                // Could not find the playlist (Mixes not yet supported).
                metadata = await getSongMetadata(song, 'ytvideo');
                if (!metadata) {
                    message.channel.send('❌ No se han encontrado resultados. Esto puede deberse a que la canción **es para usuarios Premium o es privada**.')
                    return;
                }
                newSongQueue.push(new Song(metadata.type, metadata.title, metadata.url, metadata.durationTimestamp, metadata.durationInSeconds, metadata.thumbnail, requesterObj));
            }
        } else {
            metadata = await getSongMetadata(song, 'ytvideo');
            if (!metadata) {
                message.channel.send('❌ No se han encontrado resultados. Esto puede deberse a que la canción **es para usuarios Premium o es privada**.')
                return;
            }
            newSongQueue.push(new Song(metadata.type, metadata.title, metadata.url, metadata.durationTimestamp, metadata.durationInSeconds, metadata.thumbnail, requesterObj));
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
        newSongQueue.push(new Song(metadata.type, metadata.title, metadata.url, metadata.durationTimestamp, metadata.durationInSeconds, metadata.thumbnail, requesterObj));
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
        const stream = currentSong.getStream();

        // Create the audio source and play it.
        let resource = createAudioResource(stream as any);
        player.play(resource);

        // Create a document in the database to save the queue.
        await serverQueue.updateSongQueue(newSongQueue);

        if (newSongQueue.length > 1) {
            const songEmbed = new EmbedBuilder()
                .setColor(config.playerEmbeds.colors.queuedColor as ColorResolvable)
                .setTitle(metadata.title!)
                .setURL(metadata.url!)
                .setAuthor({ name: 'En cola ♪' })
                .setDescription(`¡La playlist 🎧 fue añadida con \`${newSongQueue.length}\` canciones!`)
                .setThumbnail(metadata.thumbnail!)
                .setFooter({ text: `Pedida por ${newSongQueue[0].requester.tag}`, iconURL: newSongQueue[0].requester.avatar })
            message.channel.send({ embeds: [songEmbed] });
        }

        EventManager(guildId, serverQueue);
        return;
    } else if (!serverQueue.playing) { // bot is connected bot not playing audio.
        // Plays audio.
        const player = serverQueue.player;
        let currentSong = newSongQueue[0];
        const stream = currentSong.getStream();
        let resource = createAudioResource(stream as any);
        player.play(resource);

        if (newSongQueue.length > 1) { // If it is a playlist.
            const songEmbed = new EmbedBuilder()
                .setColor(config.playerEmbeds.colors.queuedColor as ColorResolvable)
                .setTitle(metadata.title!)
                .setURL(metadata.url!)
                .setAuthor({ name: 'En cola ♪' })
                .setDescription(`¡La playlist 🎧 fue añadida con \`${newSongQueue.length}\` canciones!`)
                .setThumbnail(metadata.thumbnail!)
                .setFooter({ text: `Pedida por ${newSongQueue[0].requester.tag}`, iconURL: newSongQueue[0].requester.avatar })
            message.channel.send({ embeds: [songEmbed] });
        }
        const songEmbed = newSongQueue[0].displayCurrentSong();
        
        playerButtons.components[1].setCustomId('pause_playback').setLabel('❚❚').setStyle(ButtonStyle.Secondary);
        const sentMessage = await message.channel.send({ embeds: [songEmbed], components: [playerButtons] });

        serverQueue.playing = true;
        serverQueue.lastMessage = sentMessage;
    } else { // Bot is connected and playing audio.
        if (newSongQueue.length > 1) {
            const songEmbed = new EmbedBuilder()
                .setColor(config.playerEmbeds.colors.queuedColor as ColorResolvable)
                .setTitle(metadata.title!)
                .setURL(metadata.url!)
                .setAuthor({ name: 'En cola ♪' })
                .setDescription(`¡La playlist 🎧 fue añadida con \`${newSongQueue.length}\` canciones!`)
                .setThumbnail(metadata.thumbnail!)
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
async function pause(guildId: string, requester: GuildMember) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    if(!serverQueue) return;

    playerButtons.components[1].setCustomId('resume_playback').setLabel('▶').setStyle(ButtonStyle.Success);

    const editedEmbed = EmbedBuilder.from(serverQueue.lastMessage!.embeds[0])
        .setColor(config.playerEmbeds.colors.stoppedColor as ColorResolvable)
        .setDescription(`Reproductor de audio pausado por ${requester!.user.tag}`)
    serverQueue.lastMessage!.edit({embeds: [editedEmbed], components: [playerButtons]});

    serverQueue.player.pause();
    return;
}

// Resumes playback for the selected guild.
async function resume(guildId: string, requester: GuildMember) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    if(!serverQueue) return;

    playerButtons.components[1].setCustomId('pause_playback').setLabel('❚❚').setStyle(ButtonStyle.Secondary);

    const editedEmbed = EmbedBuilder.from(serverQueue.lastMessage!.embeds[0])
        .setColor(config.playerEmbeds.colors.playingColor as ColorResolvable)
        .setDescription(`Reproductor de audio reanudado por ${requester!.user.tag}`)
    serverQueue.lastMessage!.edit({embeds: [editedEmbed], components: [playerButtons]});

    serverQueue.player.unpause();
    return;
}

// Sends an embed showing current time of the playing audio.
async function nowplaying(guildId: string) {
    const serverQueue = serverQueues.get(guildId);
    if(!serverQueue) return;

    // Get channel and song queue.
    const songQueue = await serverQueue.getSongQueue() as Song[];
    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;

    // Remove componets from last message.
    serverQueue.lastMessage!.edit({components: []});

    // Calculate duration progress.
    const currentTime = Math.round(Date.now() / 1000) - serverQueue.startTimeInSec!;
    const songEmbed = songQueue[0].displayCurrentSong(progressBar(songQueue[0].durationInSeconds!, currentTime));

    // Send embed with new components.
    channel.send({embeds: [songEmbed], components: [playerButtons]});
    
}

// Skips a track for the selected guild.
async function skip(guildId: string, requester: GuildMember) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    if(!serverQueue) return;

    const editedEmbed = EmbedBuilder.from(serverQueue.lastMessage!.embeds[0])
        .setColor(config.playerEmbeds.colors.skipedColor as ColorResolvable)
        .setDescription(`Canción saltada por ${requester!.user.tag}`)
    serverQueue.lastMessage!.edit({embeds: [editedEmbed], components: []});

    serverQueue.loop = false;
    serverQueue.player.unpause();
    serverQueue.player.stop();

    return;
}

// Removes a selected song from the queue.
async function remove(guildId: string, index: number, requester: GuildMember) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    if(!serverQueue) return;

    const songQueue = await serverQueue.getSongQueue() as Song[];
    songQueue.splice(index, 1);
    serverQueue.updateSongQueue(songQueue);

    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;

    const songEmbed = new EmbedBuilder()
        .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
        .setDescription(`Pista \`${index}\` ha sido removida de la cola.♪`)
        .setFooter({ text: `Pedido por ${requester!.user.tag}`, iconURL: requester!.displayAvatarURL({forceStatic: false}) })
    channel.send({embeds: [songEmbed]});
    return;
}

// Loops the current song.
async function loop(guildId: string, requester: GuildMember) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    if(!serverQueue) return;

    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;
    const songQueue = await serverQueue.getSongQueue() as Song[];

    if(songQueue[0].type === 'ytlive') {
        channel.send('Esta función no está disponible para videos en vivo.');
        return;
    }

    if (serverQueue.loop) {
        serverQueue.loop = false;
        const songEmbed = new EmbedBuilder()
            .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
            .setDescription(`Repetición **ha sido desactivada**.`)
            .setFooter({ text: `Pedido por ${requester!.user.tag}`, iconURL: requester!.displayAvatarURL({forceStatic: false}) })
        
        channel.send({ embeds: [songEmbed] });
    } else {
        serverQueue.loop = true;
        const songEmbed = new EmbedBuilder()
            .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
            .setDescription(`Repetición **ha sido activada**.`)
            .setFooter({ text: `Pedido por ${requester!.user.tag}`, iconURL: requester!.displayAvatarURL({forceStatic: false}) })
        channel.send({ embeds: [songEmbed] });
    }
    serverQueues.set(guildId, serverQueue);

    return;
}

// Shuffles the queue for a particular guild.
async function shuffle(guildId: string, requester: GuildMember) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    if(!serverQueue) return;

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
        .setFooter({ text: `Pedido por ${requester!.user.tag}`, iconURL: requester!.displayAvatarURL({forceStatic: false}) })
    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;
    channel.send({ embeds: [songEmbed] });

    serverQueue.updateSongQueue(songQueue!);
    return;
}

// Replays the current song immediately.
function replay(guildId: string, requester: GuildMember) {

}

// Stops the player and disconnects from the voice channel.
function stop(guildId: string, requester: GuildMember | undefined) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    if(!serverQueue) return;
    
    const connection = getVoiceConnection(guildId)!;
    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;

    playerButtons.components[1].setCustomId('pause_playback').setLabel('❚❚').setStyle(ButtonStyle.Secondary);

    if(requester) {
        const editedEmbed = EmbedBuilder.from(serverQueue.lastMessage!.embeds[0])
        .setColor(config.playerEmbeds.colors.stoppedColor as ColorResolvable)
        .setDescription(`Reproductor de audio detenido por ${requester!.user.tag}`)
    serverQueue.lastMessage!.edit({embeds: [editedEmbed]});
    }

    if (serverQueue.player.state.status === AudioPlayerStatus.Paused) {
        serverQueue.player.unpause();
    }

    serverQueue.collector!.stop();
    serverQueue.dropSongQueue();
    connection!.destroy();
    serverQueue.player.removeAllListeners();
    serverQueue.player.stop();
    serverQueues.delete(guildId);

    const disconnectedEmbed = new EmbedBuilder()
        .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
        .setAuthor({ name: "Desconectada" })
        .setDescription('Me he desconectado del canal de voz. Nos vemos!')
    channel.send({ embeds: [disconnectedEmbed] });
    return;
}

// Clear the queue.
function clear(guildId: string, requester: GuildMember) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    if(!serverQueue) return;

    serverQueue.deleteQueue();

    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;

    const songEmbed = new EmbedBuilder()
        .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
        .setDescription(`La lista de canciones ha sido borrada.`)
        .setFooter({ text: `Pedido por ${requester!.user.tag}`, iconURL: requester!.displayAvatarURL({forceStatic: false}) })
    channel.send({embeds: [songEmbed]});

    return;
}

async function bassBoost(guildId: string, requester: GuildMember) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    if(!serverQueue) return;

    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;
    const songQueue = await serverQueue.getSongQueue() as Song[];

    let stream: any;
    const songEmbed = new EmbedBuilder();
    if (serverQueue.nightCore && !serverQueue.bassBoost) {
        stream = songQueue[0].getStream('nightcore-bassboost');
        serverQueue.bassBoost = true;
        songEmbed
            .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
            .setDescription('Nightcore y Bassboost están habilitados.')
            .setFooter({ text: `Pedido por ${requester!.user.tag}`, iconURL: requester!.user.avatarURL({forceStatic: false})! })
    } else if (!serverQueue.nightCore && !serverQueue.bassBoost){
        stream = songQueue[0].getStream('bassboost');
        serverQueue.bassBoost = true;
        songEmbed
            .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
            .setDescription('Bassboost habilitado.')
            .setFooter({ text: `Pedido por ${requester!.user.tag}`, iconURL: requester!.user.avatarURL({forceStatic: false})! })
    } else {
        stream = songQueue[0].getStream('none');
        serverQueue.bassBoost = false;
        songEmbed
            .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
            .setDescription('Bassboost dehabilitado.')
            .setFooter({ text: `Pedido por ${requester!.user.tag}`, iconURL: requester!.user.avatarURL({forceStatic: false})! })
    }
    channel.send({embeds: [songEmbed]});

    const resource = createAudioResource(stream);
    serverQueue.player.pause();
    serverQueue.player.play(resource);
    
    serverQueues.set(guildId, serverQueue);
}

async function nightCore(guildId: string, requester: GuildMember) {
    const serverQueue = serverQueues.get(guildId) as SongQueue;
    if(!serverQueue) return;
    
    const songQueue = await serverQueue.getSongQueue() as Song[];
    const channel = client.channels.cache.get(serverQueue.textChannelId)! as TextChannel;

    let stream: any;

    const songEmbed = new EmbedBuilder();
    if (serverQueue.bassBoost && !serverQueue.nightCore) {
        stream = songQueue[0].getStream('nightcore-bassboost');
        serverQueue.nightCore = true;
        songEmbed
            .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
            .setDescription('Bassboost y Nightcore están habilitados.')
            .setFooter({ text: `Pedido por ${requester!.user.tag}`, iconURL: requester!.user.avatarURL({forceStatic: false})! })
    } else if (!serverQueue.bassBoost && !serverQueue.nightCore){
        stream = songQueue[0].getStream('nightcore');
        serverQueue.nightCore = true;
        songEmbed
        .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
        .setDescription('Nightcore habilitado.')
        .setFooter({ text: `Pedido por ${requester!.user.tag}`, iconURL: requester!.user.avatarURL({forceStatic: false})! })
    } else {
        stream = songQueue[0].getStream('none');
        serverQueue.nightCore = false;
        songEmbed
            .setColor(config.embeds.colors.defaultColor2 as ColorResolvable)
            .setDescription('Nightcore deshabilitado.')
            .setFooter({ text: `Pedido por ${requester!.user.tag}`, iconURL: requester!.user.avatarURL({forceStatic: false})! })
    }
    channel.send({embeds: [songEmbed]});
    
    const resource = createAudioResource(stream);
    serverQueue.player.pause();
    serverQueue.player.play(resource);

    serverQueues.set(guildId, serverQueue);
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
    nowplaying,
    skip,
    remove,
    loop,
    shuffle,
    replay,
    stop,
    clear,
    bassBoost,
    nightCore,
    getSongQueue,
    getServerQueues
}