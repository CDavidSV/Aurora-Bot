import { Client, Message } from "discord.js";

export default {
    aliases: ['warn'],
    // Main function.
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        message.reply('Lo siento, pero este comando aún está en desarrollo.');

    }
}