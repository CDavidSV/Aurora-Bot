import { Client, Message, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import MCommand from '../../Classes/MCommand';


export default {
    data: new SlashCommandBuilder()
        .setName('massban')
        .setDescription('Bans multiple members'),
    aliases: ['massban'],
    category: 'Moderación',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],

    // Main function.
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        message.reply('Lo siento, pero este comando aún está en desarrollo.');

    }
} as MCommand