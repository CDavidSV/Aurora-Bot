import { Client, Message, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import MCommand from '../../Classes/MCommand';


export default {
    data: new SlashCommandBuilder()
        .setName('setnick')
        .setDescription("sets a member's nick"),
    aliases: ['setnick'],
    category: 'Moderación',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
    // Main function.
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        message.reply('Lo siento, pero este comando aún está en desarrollo.');

    }
} as MCommand