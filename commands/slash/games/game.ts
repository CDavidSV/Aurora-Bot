import { CacheType, ChatInputCommandInteraction, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import simpleGames from "../../../games/simple-games";

export default {
    data: new SlashCommandBuilder()
        .setName('game')
        .setDescription('🎮 Play a variety of games')
        .addSubcommand(subcommand =>
            subcommand
                .setName('coinflip')
                .setDescription('🪙 Flip a coin'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('dice')
                .setDescription('🎲 Throw a dice'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('double_dice')
                .setDescription('🎲🎲 Throw two dices'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('8ball')
                .setDescription('🎱 Ask a Magical BALL something')
                .addStringOption(option =>
                    option
                        .setName('prompt')
                        .setDescription('Ask anything')
                        .setRequired(true))),
    botPerms: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {
        const subcommands = interaction.options.getSubcommand()
        const member = interaction.member as GuildMember;

        let username;
        if(!member) {
            username = interaction.user.username as string;
        } else {
            username = member.displayName;
        }

        switch (subcommands) {
            case 'coinflip':
                await interaction.reply(simpleGames.coinflip(username as string));
                break;
            case 'dice':
                await interaction.reply(`${username} Flipped a dice and got ${simpleGames.dice()}`);
                break;
            case 'double_dice':
                await interaction.reply(`${username} Flipped two dices and got ${simpleGames.dice()} ${simpleGames.dice()}`);    
                break;
            case '8ball':
                const responseEmbed = simpleGames.eightBall(interaction.client!.user!.avatarURL()!, interaction.options.getString('prompt') as string);
                await interaction.reply({ embeds: [responseEmbed]});
                break;
        }
    }
}