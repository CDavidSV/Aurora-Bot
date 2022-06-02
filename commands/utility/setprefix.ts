// Change the server's prefix.

import mongo from '../../mongo';
import { Client, Message, Permissions, MessageEmbed, MessageAttachment, ColorResolvable } from 'discord.js';
import config from '../../config.json';
const prefixScheema = require('../../schemas/prefix-scheema');
import update from '../../updateObjects';

export default {
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {
        await mongo().then(async mongoose => {
            try {
                const guildId = message.guild!.id;
                await prefixScheema.findOneAndUpdate({
                    _id: guildId
                }, {
                    _id: guildId,
                    prefix: args[1]
                }, {
                    upsert: true
                })
                message.reply(`El prefijo del servidor se cambió a ${args[1]}`);
            } finally {
                mongoose.connection.close();
            }

        })
    }
}