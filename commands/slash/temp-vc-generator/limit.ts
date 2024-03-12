import { ChatInputCommandInteraction, CacheType, StringSelectMenuInteraction, EmbedBuilder, ColorResolvable } from "discord.js";
import { generatorSelect } from "../../../handlers/generator-select-handler";
import config from "../../../config.json";
import tempvcGeneratorsSchema from "../../../scheemas/tempvcGeneratorsSchema";

export default {
    subCommand: 'tempvc.limit',
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {
        generatorSelect(interaction, async (generatorId: string) => {
            const generatorEmbed = new EmbedBuilder().setFooter({ text: config.version });
            const selectedLimit = interaction.options.getInteger('max');
            
            try {
                const generator = await tempvcGeneratorsSchema.findOneAndUpdate(
                    { guild_id: interaction.guildId, generator_id: generatorId }, 
                    { vc_user_limit: selectedLimit }
                );

                generatorEmbed
                .setTitle('Generator settings successfully updated')
                .setColor(config.embeds.colors.success as ColorResolvable)
                .setDescription(`limit: ${generator?.vc_user_limit || "N/A"} -> ${interaction.options.getInteger('max')}`)
                .setTimestamp()
            } catch {
                generatorEmbed
                .setTitle('Unexpected Error')
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setDescription("An unexpected error occurred while attempting to update the generator's settings. Please try again.")
                .setTimestamp()
            }

            if (!interaction.replied) {
                interaction.reply({ embeds: [generatorEmbed], components: [], ephemeral: true  }).catch(console.error);
            } else {
                interaction.editReply({ embeds: [generatorEmbed], components: [] }).catch(console.error);
            }
        });
    }
}