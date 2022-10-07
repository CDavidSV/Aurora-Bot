// Command to play a requested song.

import { CacheType, ChatInputCommandInteraction, Message, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import playercore from '../../player/playercore';
import MCommand from "../../Classes/MCommand";

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription("Plays a requested song.")
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Nombre o enlace de la canción.')
                .setRequired(true)
                .setMinLength(3)),
    category: 'Música',
    aliases: ['play', 'p'],
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    userPerms: [],
    // Main function.
    async execute(message: Message, prefix: string, interaction: ChatInputCommandInteraction<CacheType>, ...args: string[]) {

        let botVc;
        let memberVc;
        let song: string;
        if (message) {
            botVc = message.guild!.members.me!.voice.channel;
            memberVc = message.member!.voice.channel;

            // Get the requested song(s) from args.
            song = args.slice(1).toString().replace(/,/g, " ");

        } else {
            botVc = interaction.guild!.members.me!.voice.channel;
            memberVc = interaction.guild?.members.cache.get(interaction.user.id)!.voice.channel;

            song = interaction.options.getString('query')!;
        }

        if (!memberVc) {
            message.reply("Necesitas estar dentro de un ****canal de voz****.");
            return;
        }
        if (!interaction && args.length < 2) {
            message.reply(`Necesitas ingresar el nombre de la canción. \nIntenta ingresando: \`${prefix}play <canción o URL del video>\``);
            return;
        }
        if (botVc && memberVc.id != botVc.id) {
            message.reply('Lo siento pero ya estoy dentro de un canal y no pienso moverme. Mejor ven tú UwU.');
            return;
        }
        if (!memberVc.viewable) {
            message.reply('Lo siento, pero no tengo permisos para unirme a ese canal de voz.');
            return;
        }

        playercore.play(message, song);
    }
} as MCommand