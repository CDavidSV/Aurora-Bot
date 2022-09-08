import { EmbedBuilder, ColorResolvable, TextChannel, ButtonBuilder, ActionRowBuilder, ButtonStyle, ButtonInteraction, CollectedInteraction } from 'discord.js';

import config from '../../config.json';
import playercore from '../playercore';

export default class Song {
    // Variables.
    public type: string;
    public title: string | null;
    public url: string | null;
    public durationTimestamp: string | null;
    public thumbnail: string | null;
    public requester: { tag: string | undefined; avatar: string | undefined; } = { tag: undefined, avatar: undefined };

    // Constructor.
    constructor(type: string, title: string | null, url: string | null, durationTimestamp: string | null, thumbnail: string | null, requester: { tag: string | undefined, avatar: string | undefined }) {
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
}