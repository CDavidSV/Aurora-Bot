// Playback from selected timestamp.
import { Client, Message, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import MCommand from '../../Classes/MCommand';

export default {
    data: new SlashCommandBuilder()
        .setName('seek')
        .setDescription("unbans a member"),
    category: 'Moderación',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
    aliases: ['seek'],

    // Main function.
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        message.reply('Lo siento, pero este comando aún está en desarrollo.');

    }
} as MCommand