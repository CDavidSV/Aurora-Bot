import { ActionRowBuilder, ChatInputCommandInteraction, Collector, ColorResolvable, EmbedBuilder, InteractionType, PermissionFlagsBits, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import config from "../../../config.json";
import userWarningsSchema from "../../../schemas/userWarningsSchema";
import ObjectId from 'mongoose';
import { constructWarningsEmbed, getUserWarnings } from "../../../util/herper-functions";
import PaginationButtonHandler from "../../../handlers/pagination-button-handler";

export default {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('📑 Remove a warning from a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User to remove a warning from. Mention or id.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('warning')
                .setDescription('Warning to remove. Warning id. Use /warnings to get the warning id.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    botPerms: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
    callback: async (interaction: ChatInputCommandInteraction) => {
        const buildSelectRow = (warnings: any) => {
            return new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId('unwarn_select_menu')
                .setPlaceholder('Select a warning to remove')
                .setMinValues(1)
                .setMaxValues(warnings.data.length)
                .addOptions(warnings.data.map((warning: any, index: number) => {
                return new StringSelectMenuOptionBuilder()
                    .setLabel(`Warning ${warnings.page * warnings.countPerPage - (warnings.countPerPage - (index + 1))}:`)
                    .setValue(warning.id)
                    .setDescription(warning.reason.slice(0, 97) + '...')
                })
            ));
        };

        const user = interaction.options.getUser('user', true);
        const warningId = interaction.options.getString('warning', false);

        let embed = new EmbedBuilder()
        .setAuthor({ name: 'Failed to remove warning.', iconURL: config.embeds.images.errorImg })
        .setColor(config.embeds.colors.error as ColorResolvable)

        if (warningId) {
            try {
                if (!ObjectId.isValidObjectId(warningId)) {
                    embed.setDescription("Invalid warning id.");
                    interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
                    return;
                }

                const deletedWarning = await userWarningsSchema.findOneAndDelete({ user_id: user.id, guild_id: interaction.guildId, _id: warningId }).exec();
                if (!deletedWarning) {
                    embed.setDescription("Warning not found. No warnings were removed.");
                    interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
                    return;
                }

                embed
                    .setAuthor({ name: 'Warning removed successfully.', iconURL: config.embeds.images.successImg })
                    .setColor(config.embeds.colors.success as ColorResolvable)
                    .setDescription(`Warning with id **${warningId}** was removed successfully.`);
                interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
                return;
            } catch (err) {
                console.error(err);
                interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
                return;
            }
        }

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
        let selectRow = buildSelectRow(warnings);
        const replyMsg = await interaction.reply({ content: `Page **${paginator.getCurrentPageNumber() + 1}** of **${paginator.getTotalPages()}**`, embeds: [pageEmbed], ephemeral: true, components: [selectRow, paginator.getButtons()], fetchReply: true }).catch(console.error);
        if (!replyMsg) return;

        const collector = interaction.channel?.createMessageComponentCollector({ 
            filter: (colectorInteraction) => colectorInteraction.message.id === replyMsg.id,
            time: 840_000
        });

        collector?.on('end', () => {
            interaction.editReply({ components: [] }).catch(console.error);
        });

        collector?.on('collect', async (collectedInteraction) => {
            if (collectedInteraction.isStringSelectMenu() && collectedInteraction.customId === 'unwarn_select_menu') {
                collector.stop();
                try {
                    const deletedWarnings = await userWarningsSchema.deleteMany({ _id: { $in: collectedInteraction.values } }).exec();
                    if (deletedWarnings.deletedCount === 0) {
                        embed.setDescription("No warnings were removed.");
                        collectedInteraction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
                        return;
                    }

                    embed
                        .setAuthor({ name: 'Warnings removed successfully.', iconURL: config.embeds.images.successImg })
                        .setColor(config.embeds.colors.success as ColorResolvable)
                        
                    collectedInteraction.update({ components: [], embeds: [embed], content: "" }).catch(console.error);
                    return;
                } catch (err) {
                    console.error(err);
                    await collectedInteraction.deferUpdate().catch(console.error);
                    await collectedInteraction.deleteReply().catch(console.error);

                    embed
                        .setAuthor({ name: 'Failed to remove warnings.', iconURL: config.embeds.images.errorImg })
                        .setDescription("An error occurred while removing the warnings.");
                    collectedInteraction.followUp({ embeds: [embed] , ephemeral: true }).catch(console.error);
                    return;
                }
            }

            const pageData = paginator.getPageOnButtonId(collectedInteraction.customId);
            if (!pageData) {
                collector.stop();
                await collectedInteraction.deferUpdate().catch(console.error);
                await collectedInteraction.deleteReply().catch(console.error);
                return;
            }

            const { warnings, error } = await getUserWarnings(user.id, interaction.guildId!, interaction.client, pageData.page + 1);
            if (error !== null) {
                await collectedInteraction.deferUpdate().catch(console.error);
                await collectedInteraction.deleteReply().catch(console.error);
                embed
                    .setAuthor({ name: 'An error occurred while fetching the page.', iconURL: config.embeds.images.errorImg })
                collectedInteraction.followUp({ embeds: [embed], ephemeral: true }).catch(console.error);
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
                collectedInteraction.update({ content: `Page **${paginator.getCurrentPageNumber() + 1}** of **${paginator.getTotalPages()}**`, components: [selectRow, paginator.getButtons()] }).catch(console.error);
                return;
            }

            selectRow = buildSelectRow(warnings);
            pageEmbed = constructWarningsEmbed(warnings, user.username, user.id, user.avatarURL({ forceStatic: false })!);

            collectedInteraction.update({ content: `Page **${paginator.getCurrentPageNumber() + 1}** of **${paginator.getTotalPages()}**`, embeds: [pageEmbed], components: [selectRow, pageData.buttons] }).catch(console.error);
        });       
    }
}