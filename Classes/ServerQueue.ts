import { AudioPlayer } from '@discordjs/voice';
import { ButtonInteraction, CacheType, InteractionCollector, Message, SelectMenuInteraction } from 'discord.js';
import Song from './Song';
const queueScheema = require("../mongoDB/schemas/queue-scheema");

type Filters = 'bassboost' | 'nightcore' | 'daycore' | 'reverb';

export default class ServerQueue {
    // Variables.
    public guildId: string;
    public size: number = 0;
    public textChannelId: string;
    public lastMessage: Message | undefined;
    public player: AudioPlayer;
    public playing: boolean = true;
    public loop: boolean = true;
    public startTimeInSec: number = 0;
    public pausedTimeInSec: number = 0;
    public collector: InteractionCollector<ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>> | undefined;
    public filters: Filters[] = [];

    // Constructor.
    constructor(guildId: string, textChannelId: string, subscription: AudioPlayer, playing: boolean, loop: boolean) {
        this.guildId = guildId;
        this.textChannelId = textChannelId;
        this.player = subscription;
        this.playing = playing;
        this.loop = loop;
    }

    // Methods.

    // Updates the song queue in the database.
    async updateSongQueue(songQueue: Song[]) {
        await queueScheema.findOneAndUpdate({
            _id: this.guildId
        }, {
            _id: this.guildId,
            songQueue: songQueue
        }, {
            upsert: true
        })
    }

    // Add a song or list of songs to the queue.
    async addSongs(songQueue: Song[]) {
        await queueScheema.updateOne({
            _id: this.guildId
        }, {
            $push: { songQueue: { $each: songQueue } }
        })
    }

    // Removes the first song from the queue (finished playing).
    async pop() {
        await queueScheema.updateOne({
            _id: this.guildId
        }, {
            $pop: { songQueue: -1 }
        })
    }

    // Returns the current song queue for that server.
    async getSongQueue() {
        const serverQueue = await queueScheema.findOne({ _id: this.guildId });
        if (!serverQueue) return;
        let queue: Song[] = []
        serverQueue.songQueue.forEach((element: Song) => {
            queue.push(new Song(element.type, element.title, element.author, element.url, element.durationTimestamp, element.durationInSeconds, element.thumbnail, element.requester));
        });
        return queue;
    }

    async deleteQueue() {
        await queueScheema.findOneAndUpdate({
            _id: this.guildId
        }, {
            _id: this.guildId,
            songQueue: []
        }, {
            upsert: true
        })
    }

    async dropSongQueue() {
        await queueScheema.deleteOne({ _id: this.guildId });
    }

    addFilter(filter: Filters) {
        if (this.filters.includes(filter)) {
            return;
        }
        if (filter === 'nightcore') {
            this.filters.splice(this.filters.indexOf('daycore'), 1);
        }
        if (filter === 'daycore') {
            this.filters.splice(this.filters.indexOf('nightcore'), 1);
        }

        this.filters.push(filter);
    }

    removeFilter(filter: Filters) {
        this.filters.splice(this.filters.indexOf(filter), 1);
    }

    removeAllFilters() {
        this.filters = [];
    }
}