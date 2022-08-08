// Command to pase current song if there is a player.

import config from '../../config.json';
import { Client, Message } from 'discord.js';
import playercore from '../../handlers/player/playercore';

export default {
    aliases: ['pause'],
    // Main function.
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        playercore.pause(message.guildId!);    
    }
}
