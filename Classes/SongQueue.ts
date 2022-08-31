import { PlayerSubscription } from '@discordjs/voice';
import Song from './Song';
const queueScheema = require("../mongoDB/schemas/queue-scheema");

export default class ServerQueue {
    // Variables.
    public guildId: string;
    public textChannelId: string;
    public subscription: PlayerSubscription;
    public playing: boolean;
    public loop: boolean;

    // Constructor.
    constructor(guildId: string, textChannelId: string, subscription: PlayerSubscription, playing: boolean, loop: boolean) {
        this.guildId = guildId;
        this.textChannelId = textChannelId;
        this.subscription = subscription;
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
        let queue: Song[] = []
        serverQueue.songQueue.forEach((element: Song) => {
            queue.push(new Song(element.type, element.title, element.url, element.durationTimestamp, element.thumbnail, element.requester));
        });
        return queue;
    }

    async dropSongQueue() {
        await queueScheema.deleteOne({ _id: this.guildId });
    }
}