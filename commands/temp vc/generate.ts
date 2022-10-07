// Generates a private voice channel.
import { CacheType, ChatInputCommandInteraction, Message, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import MCommand from "../../Classes/MCommand";

export default {
    data: new SlashCommandBuilder()
        .setName('generate')
        .setDescription('Generates a private voice channel.'),
    aliases: ['generate'],
    category: 'Canales de voz temporales',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
    // Main function.
    async execute(message: Message, prefix: string, interaction: ChatInputCommandInteraction<CacheType>, ...args: string[]) {

        message.reply('Lo siento, pero este comando aún está en desarrollo.');

    }
} as MCommand