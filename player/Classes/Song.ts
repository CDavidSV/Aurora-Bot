import { EmbedBuilder, ColorResolvable } from 'discord.js';
import ytdl from 'ytdl-core';
import config from '../../config.json';

export default class Song {
    // Variables.
    public type: string | undefined;
    public title: string | undefined;
    public author: string | undefined
    public url: string | undefined;
    public durationTimestamp: string | undefined;
    public durationInSeconds: number | undefined;
    public thumbnail: string | undefined;
    public requester: { tag: string | undefined; avatar: string | undefined; } = { tag: undefined, avatar: undefined };

    // Constructor.
    constructor(type: string | undefined, title: string | undefined, author: string | undefined, url: string | undefined, durationTimestamp: string | undefined, durationInSeconds: number | undefined, thumbnail: string | undefined, requester: { tag: string | undefined, avatar: string | undefined }) {
        this.type = type;
        this.title = title;
        this.author = author;
        this.url = url;
        this.durationTimestamp = durationTimestamp;
        this.durationInSeconds = durationInSeconds;
        this.thumbnail = thumbnail;
        this.requester.tag = requester.tag;
        this.requester.avatar = requester.avatar;
    }

    // Methods.

    // Displays currently playing song.
    displayCurrentSong(currentDurationProgress: string | undefined = undefined) {
        // Embed.
        const songEmbed = new EmbedBuilder()
            .setColor(config.playerEmbeds.colors.playingColor as ColorResolvable)
            .setTitle(this.title!)
            .setURL(this.url!)
            .setAuthor({ name: "Ahora Suena ♪", iconURL: config.playerEmbeds.images.playingImage })
            .setThumbnail(this.thumbnail!)
            .setFooter({ text: `Pedida por ${this.requester.tag}`, iconURL: this.requester.avatar })
        if (!currentDurationProgress || this.durationInSeconds === 0) {
            songEmbed.addFields({ name: 'Duración', value: `\`${this.durationTimestamp}\``, inline: true });
        } else {
            songEmbed.addFields({ name: 'Duración', value: `\`${currentDurationProgress}\``, inline: true });
        }
        songEmbed.addFields({ name: 'Autor', value: `${this.author}`, inline: true })

        return songEmbed;
    }

    // Displays queued song.
    displayQueuedSong() {
        const songEmbed = new EmbedBuilder()
            .setColor(config.playerEmbeds.colors.queuedColor as ColorResolvable)
            .setTitle(this.title!)
            .setURL(this.url!)
            .setAuthor({ name: 'Canción añadida a la cola ♪' })
            .setThumbnail(this.thumbnail!)
            .setFooter({ text: `Pedida por ${this.requester.tag}`, iconURL: this.requester.avatar })

        return songEmbed;
    }

    // Gets a readeble stream for the discord player.
    getStream() {
        if (!this.url) {
            throw new Error('This song has no url.');
        }

        let stream: any;

        let normalOptions = { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25, fmt: 'mp3' } as any;
        let liveOptions = { highWaterMark: 1 << 25, dlChunkSize: 0, quality: [91, 92, 93, 94, 95], opusEncoded: true, liveBuffer: 4900 } as any;

        // Select appropriate stream depending on the source.
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