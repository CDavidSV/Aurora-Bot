import { Client, Message, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import MCommand from '../../Classes/MCommand';


export default {
    data: new SlashCommandBuilder()
        .setName('tempban')
        .setDescription("temporarily bans a member"),
    aliases: ['tempban'],
    category: 'Moderación',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
    // Main function.
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        message.reply('Lo siento, pero este comando aún está en desarrollo.');

    }
} as MCommand