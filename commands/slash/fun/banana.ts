import { CommandInteraction, EmbedBuilder, GuildMember, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import random from "../../../util/random";

export default {
    data: new SlashCommandBuilder()
        .setName('banana')
        .setDescription('🍌 How long is your banana'),
    botPerms: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
    callback: (interaction: CommandInteraction) => {
        // Generate random size and color.
        const randomColor  = random.randomColor();
        const randomSize = random.randomValue(7, 21);
        const member = interaction.member as GuildMember;

        let username;
        if(!member) {
            username = interaction.user.username as string;
        } else {
            username = member.displayName;
        }

        const bananaSizeEmbed = new EmbedBuilder()
            .setColor("Random")
            .setTitle(`${username}'s banana is ${randomSize} cm long.`)
            .setImage("https://cdn.discordapp.com/attachments/1102351325120974979/1105891025089744968/banana.png");

        interaction.reply({ embeds: [bananaSizeEmbed], allowedMentions: { repliedUser: false } })
    },
};