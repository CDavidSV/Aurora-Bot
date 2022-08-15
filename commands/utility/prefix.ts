// Returns random "banana" size for the user. For fun!
// Copied from Nekotina xD.

import { Client, Message } from 'discord.js';
const prefixScheema = require('../../mongoDB/schemas/prefix-scheema');
import mongo from '../../mongoDB/mongo';

export default {
    aliases: ['prefix'],
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        // Get server's prefix.
        await mongo().then(async mongoose => {
            try {
                const guildId = message.guildId;
                const ServerPrefix = await prefixScheema.findOne({ _id: guildId });
                if (!ServerPrefix) {
                    message.reply('Este servidor no tiene un prefijo. \n`Intenta: ma!setprefix <prefijo>`');
                } else {
                    message.reply(`El prefijo para este servidor es: \`${ServerPrefix.prefix}\``);
                }
            } finally {
                mongoose.connection.close();
            }

        })

    }
}