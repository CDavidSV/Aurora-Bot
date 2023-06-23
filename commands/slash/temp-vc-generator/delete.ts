import { ChatInputCommandInteraction, CacheType, ActionRowBuilder, EmbedBuilder, ColorResolvable, ComponentType, ButtonInteraction, ButtonBuilder, ButtonStyle } from "discord.js";
import config from "../../../config.json";
import tempvcGeneratorScheema from "../../../scheemas/tempvcGeneratorsScheema";
import { generatorSelect } from "../../../handlers/generator-select-handler";

export default {
    subCommand: 'tempvc.delete',
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {

        generatorSelect(interaction, async (generatorId: string) => {
            const selectedChannel = generatorId;

            const btnRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`cancel${interaction.id}`)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`confirm${interaction.id}`)
                    .setLabel('Confirm')
                    .setStyle(ButtonStyle.Success),
            );

            const buttonCollector = interaction.channel?.createMessageComponentCollector({ 
                filter: (btnInteraction) => btnInteraction.user.id === interaction.user.id, 
                componentType: ComponentType.Button,
                time: 90_000
            });

            // Update the embed end edit the reply.
            const deleteEmbed = new EmbedBuilder()
                .setTitle('Confirm')
                .setColor(config.embeds.colors.warning as ColorResolvable)
                .setDescription(`Are you sure you want to **delete** this generator?\n<#${selectedChannel}>`)

            if (!interaction.replied) {
                await interaction.reply({ embeds: [deleteEmbed], components: [btnRow], ephemeral: true  });;
            } else {
                await interaction.editReply({ embeds: [deleteEmbed], components: [btnRow] });
            }

            buttonCollector?.on('collect', async (btnInteraction: ButtonInteraction) => {
                if (btnInteraction.customId.replace(/[a-z]/g, '') !== interaction.id) return;
                
                switch (btnInteraction.customId.replace(/\d/g, '')) {
                    case `confirm`:
                        try {
                            await tempvcGeneratorScheema.deleteOne({ guild_id: interaction.guild?.id, generator_id: selectedChannel });
                            await interaction.guild?.channels.delete(selectedChannel).catch(console.error);
    
                            deleteEmbed
                            .setTitle('Generator successfully deleted')
                            .setColor(config.embeds.colors.success as ColorResolvable)
                            .setDescription("The temporary voice channel generator has been deleted.")
                            .setTimestamp()
                            
                            interaction.client.tempvcGenerators.add(interaction.guild?.id + selectedChannel);
                            await interaction.editReply({ embeds: [deleteEmbed], components: [] });
                        } catch {
                            deleteEmbed
                            .setTitle('Unexpected Error')
                            .setColor(config.embeds.colors.error as ColorResolvable)
                            .setDescription("An unexpected error occurred while attempting to update the generator's settings. Please try again.")
                            .setTimestamp()
                            await interaction.editReply({ embeds: [deleteEmbed], components: [] });
                        }
                        break;
                    case `cancel`:
                        deleteEmbed
                        .setTitle('Cancelled')
                        .setColor(config.embeds.colors.error as ColorResolvable)
                        .setDescription("The action has been cancelled.")
                        .setTimestamp()
        
                        await interaction.editReply({ embeds: [deleteEmbed], components: [] });
                        break;
                }
                buttonCollector?.removeAllListeners().stop();
                await btnInteraction.deferUpdate();

            });

            // On timeout.
            buttonCollector?.on('end', async () => {
                deleteEmbed
                .setTitle('Timeout')
                .setColor(config.embeds.colors.error as ColorResolvable)
                .setDescription("You took too long to complete this action")
                .setTimestamp()

                buttonCollector?.removeAllListeners().stop();
                await interaction.editReply({ embeds: [deleteEmbed], components: [] });
            });
        });
    }
}