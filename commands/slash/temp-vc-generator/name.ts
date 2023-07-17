import { ChatInputCommandInteraction, CacheType, EmbedBuilder, ColorResolvable } from "discord.js";
import { generatorSelect } from "../../../handlers/generator-select-handler";
import config from "../../../config.json";
import tempvcGeneratorsScheema from "../../../scheemas/tempvcGeneratorsScheema";

export default {
    subCommand: 'tempvc.name',
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {

        generatorSelect(interaction, async (generatorId: string) => {
            const generatorEmbed = new EmbedBuilder().setFooter({ text: config.version });
            const selectedChannel = generatorId
            const selectedName = interaction.options.getString('custom_name');
            
            try {
                const generator = await tempvcGeneratorsScheema.findOneAndUpdate(
                    { guild_id: interaction.guildId, generator_id: selectedChannel }, 
                    { custom_vc_name: selectedName }
                );
                generatorEmbed
                .setTitle('Generator settings successfully updated')
                .setColor(config.embeds.colors.success as ColorResolvable)
                .setDescription(`Curstom vc name: ${generator?.custom_vc_name || "N/A"} -> ${interaction.options.getString('custom_name')}`)
                .setTimestamp()
            } catch {
                generatorEmbed
                .setTitle('Unexpected Error')
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setDescription("An unexpected error occurred while attempting to update the generator's settings. Please try again.")
                .setTimestamp()
            }

            if (!interaction.replied) {
                await interaction.reply({ embeds: [generatorEmbed], components: [], ephemeral: true  });
            } else {
                await interaction.editReply({ embeds: [generatorEmbed], components: [] });
            }
        });
    }
}