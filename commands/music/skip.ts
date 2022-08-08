// Command to play a requested song.

import config from '../../config.json';
import { Client, Message } from 'discord.js';
import playercore from '../../handlers/player/playercore';

// Queue for songs.
let queue: { title: string, duration: string, url: string, thumbnail: string }[] = [];

// queue(guildId, queueConstructor object {voice channel, text channel, connection, songQueue[ { url: string, requester: string } ]})
// const queue = new Map();

export default {
    aliases: ['skip'],
    // Main function.
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {

    }
}
