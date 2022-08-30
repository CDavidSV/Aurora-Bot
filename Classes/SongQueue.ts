import { User, EmbedBuilder, ColorResolvable, TextChannel } from 'discord.js';
import { PlayerSubscription } from '@discordjs/voice';
import Song from './Song';
import config from '../config.json';
const queueScheema = require("../mongoDB/schemas/queue-scheema");

export default class ServerQueue {
    // Variables.
    public guildId: string;
    public textChannelId: string;
    public subscription: PlayerSubscription;

    // Constructor.
    constructor(guildId: string, textChannelId: string, subscription: PlayerSubscription) {
        this.guildId = guildId;
        this.textChannelId = textChannelId;
        this.subscription = subscription;
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
        return await queueScheema.findOne({ _id: this.guildId }).songQueue as Song[];
    }

    async dropSongQueue() {
        queueScheema.deleteOne({ _id: this.guildId });
    }
}