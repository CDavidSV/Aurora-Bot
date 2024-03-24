import { ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { constructWarningsEmbed, getUserWarnings } from "../../../util/herper-functions";
import config from "../../../config.json";
import PaginationButtonHandler from "../../../handlers/pagination-button-handler";

export default {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('📑 View all warnings for a user')
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('User to view warnings for. Mention or id.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    botPerms: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction: ChatInputCommandInteraction) => {
        const user = interaction.options.getUser('user', true);

        let embed = new EmbedBuilder()
            .setAuthor({ name: 'An error occurred while fetching warnings.', iconURL: config.embeds.images.errorImg })
            .setColor(config.embeds.colors.error as ColorResolvable);

        const { warnings, error } = await getUserWarnings(user.id, interaction.guildId!, interaction.client);
        if (error !== null) {
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        if (warnings.count === 0) {
            embed
                .setAuthor({ name: 'No warnings found.', iconURL: config.embeds.images.errorImg })
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setDescription("This user has no warnings.");
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        let pageEmbed: EmbedBuilder = constructWarningsEmbed(warnings, user.username, user.id, user.avatarURL({ forceStatic: false })!);

        const paginator = new PaginationButtonHandler(warnings.page, warnings.pages);
        const replyMsg = await interaction.reply({ content: `Page **${paginator.getCurrentPageNumber() + 1}** of **${paginator.getTotalPages()}**`, embeds: [pageEmbed], ephemeral: true, components: [paginator.getButtons()], fetchReply: true }).catch(console.error);
        if (!replyMsg) return;

        const collector = interaction.channel?.createMessageComponentCollector({ 
            filter: (colectorInteraction) => colectorInteraction.message.id === replyMsg.id,
            time: 840_000
        });

        collector?.on('end', () => {
            interaction.editReply({ components: [] }).catch(console.error);
        });

        collector?.on('collect', async (collectedInteraction) => {
            const pageData = paginator.getPageOnButtonId(collectedInteraction.customId);

            if (!pageData) {
                collector.stop();
                await collectedInteraction.deferUpdate().catch(console.error);
                await collectedInteraction.deleteReply().catch(console.error);
                return;
            }

            const { warnings, error } = await getUserWarnings(user.id, interaction.guildId!, interaction.client, pageData.page + 1);
            if (error !== null) {
                collectedInteraction.reply({ content: 'An error occurred while fetching the page.', ephemeral: true }).catch(console.error);
                await collectedInteraction.deferUpdate().catch(console.error);
                await collectedInteraction.deleteReply().catch(console.error);
                return;
            }
            paginator.setTotalPages(warnings.pages);

            if (warnings.count === 0) {
                collector.stop();
                embed
                .setAuthor({ name: 'No warnings found.', iconURL: config.embeds.images.errorImg })
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setDescription("This user has no warnings.");
                collectedInteraction.update({ content: `Page **0** of **0**`, embeds: [embed] , components: [] }).catch(console.error);
                return;
            }

            if (warnings.data.length === 0) {
                paginator.decreasePage();
                collectedInteraction.update({ content: `Page **${paginator.getCurrentPageNumber() + 1}** of **${paginator.getTotalPages()}**`, components: [paginator.getButtons()] }).catch(console.error);
                return;
            }

            pageEmbed = constructWarningsEmbed(warnings, user.username, user.id, user.avatarURL({ forceStatic: false })!);

            collectedInteraction.update({ content: `Page **${paginator.getCurrentPageNumber() + 1}** of **${paginator.getTotalPages()}**`, embeds: [pageEmbed], components: [pageData.buttons] }).catch(console.error);
        });
    },
    cooldown: 15
}