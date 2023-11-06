import { CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import config from "../../../config.json";

export default {
    subCommand: "role.grant",
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {
        const roleAction = new EmbedBuilder();

        const guild = interaction.guild;
        const user = interaction.options.getUser('user', true);
        const role = interaction.options.getRole('role', true);

        // Checks if the user's role has enought rank to give the same role. (In case a user is trying to give his highest ranked role)
        const interationmember = guild!.members.cache.get(interaction.member!.user.id)!;
        const member = guild!.members.cache.get(user.id)!;

        if (interationmember.roles.highest.position <= role.position && interaction.member!.user.id !== guild!.ownerId) {
            roleAction
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: 'The role is locked because it is ranked higher than your highest role.', iconURL: config.embeds.images.errorImg })
            await interaction.reply({ embeds: [roleAction], ephemeral: true });
            return;
        }

        // Attempt to give the role.
        member.roles.add(role.id).then(async () => {
            roleAction
                .setColor(config.embeds.colors.success as ColorResolvable)
                .setAuthor({ name: 'Role added successfully.', iconURL: config.embeds.images.successImg })
            await interaction.reply({ embeds: [roleAction], ephemeral: true });
        }).catch(async () => {
            roleAction
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setAuthor({ name: "I don't have enough permissions to perform this action.", iconURL: config.embeds.images.errorImg })
            await interaction.reply({ embeds: [roleAction], ephemeral: true }).catch(console.error);
        });
    }
}