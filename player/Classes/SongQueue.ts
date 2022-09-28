import { AudioPlayer } from '@discordjs/voice';
import { ButtonInteraction, CacheType, InteractionCollector, Message, SelectMenuInteraction } from 'discord.js';
import Song from './Song';
const queueScheema = require("../../mongoDB/schemas/queue-scheema");

export default class SongQueue {
    // Variables.
    public guildId: string;
    public textChannelId: string;
    public lastMessage: Message | undefined;
    public player: AudioPlayer;
    public playing: boolean = true;
    public loop: boolean = true;
    public startTimeInSec: number  = 0;
    public pausedTimeInSec: number = 0;
    public bassBoost: boolean = false;
    public nightCore: boolean = false;
    public collector: InteractionCollector<ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>> | undefined;

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

    // Returns the current song queue for that server.
    async getSongQueue() {
        const serverQueue = await queueScheema.findOne({ _id: this.guildId });
        if (!serverQueue) return;
        let queue: Song[] = []
        serverQueue.songQueue.forEach((element: Song) => {
            queue.push(new Song(element.type, element.title, element.url, element.durationTimestamp, element.durationInSeconds, element.thumbnail, element.requester));
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
}