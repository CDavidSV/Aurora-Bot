import { CacheType, ChatInputCommandInteraction, Client, Message, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import MCommand from '../../Classes/MCommand';


export default {
    data: new SlashCommandBuilder()
        .setName('warns')
        .setDescription("Displays all member's warnings")
        .setDMPermission(false),
    aliases: ['warns'],
    category: 'Moderación',
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
    cooldown: 0,
    commandType: 'Slash&Prefix',

    // Main function.
    async execute(client: Client, message: Message, prefix: string, ...args: string[]) {

        message.reply('Lo siento, pero este comando aún está en desarrollo.');

    },

    async executeSlash(interaction: ChatInputCommandInteraction<CacheType>) {
        interaction.reply('Lo siento, pero este comando aún está en desarrollo.');
    }
} as MCommand