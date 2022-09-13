import { EmbedBuilder, ColorResolvable, TextChannel, ButtonBuilder, ActionRowBuilder, ButtonStyle, ButtonInteraction, CollectedInteraction } from 'discord.js';
import ytdl, { downloadOptions } from 'ytdl-core';

import config from '../../config.json';
import playercore from '../playercore';

export default class Song {
    // Variables.
    public type: string | null;
    public title: string | null;
    public url: string | null;
    public durationTimestamp: string | null;
    public thumbnail: string | null;
    public requester: { tag: string | undefined; avatar: string | undefined; } = { tag: undefined, avatar: undefined };

    // Constructor.
    constructor(type: string | null, title: string | null, url: string | null, durationTimestamp: string | null, thumbnail: string | null, requester: { tag: string | undefined, avatar: string | undefined }) {
        this.type = type;
        this.title = title;
        this.url = url;
        this.durationTimestamp = durationTimestamp;
        this.thumbnail = thumbnail;
        this.requester.tag = requester.tag;
        this.requester.avatar = requester.avatar;
    }

    // Methods.

    // Displays currently playing song.
    displayCurrentSong() {

        // Embed.
        const songEmbed = new EmbedBuilder()
            .setColor(config.playerEmbeds.colors.playingColor as ColorResolvable)
            .setTitle(this.title)
            .setURL(this.url)
            .setAuthor({ name: "Ahora Suena ♪", iconURL: config.playerEmbeds.images.playingImage })
            .setFields({ name: 'Duración', value: `\`${this.durationTimestamp}\`` })
            .setThumbnail(this.thumbnail)
            .setFooter({ text: `Pedida por ${this.requester.tag}`, iconURL: this.requester.avatar })

        return songEmbed;

    }

    // Displays queued song.
    displayQueuedSong() {
        const songEmbed = new EmbedBuilder()
            .setColor(config.playerEmbeds.colors.queuedColor as ColorResolvable)
            .setTitle(this.title)
            .setURL(this.url)
            .setAuthor({ name: 'Canción añadida a la cola ♪' })
            .setThumbnail(this.thumbnail)
            .setFooter({ text: `Pedida por ${this.requester.tag}`, iconURL: this.requester.avatar })


        return songEmbed;
    }

    // Gets a readeble stream for the discord player.
    getStream() {
        if(!this.url) {
            throw new Error('No url provided.');
        }

        let stream;

        const normalOptions = { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 } as downloadOptions;
        const liveOptions = { highWaterMark: 1 << 25, dlChunkSize: 0, quality: [91,92,93,94,95], opusEncoded: true, liveBuffer: 4900 } as downloadOptions
    
        switch (this.type) {
            case 'ytvideo':
                // Get audio from video.
                // Generate stream.
                stream = ytdl(this.url, normalOptions);
                break;
            case 'ytlive':
                // Generate stream.
                stream = ytdl(this.url, liveOptions);
                break;
        }
        return stream;
    }
}