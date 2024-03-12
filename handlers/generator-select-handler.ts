import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, CacheType, ChatInputCommandInteraction, ColorResolvable, ComponentType, EmbedBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Interaction, InteractionCollector, StringSelectMenuInteraction } from "discord.js";
import tempvcScheema from "../scheemas/tempvcGeneratorsSchema";
import config from "../config.json";

/**
 * 
 * @param guildId 
 * @returns Promise for the guilds vc generators
 */
const getGenerators = async (guildId: string) => {
    try {
        return await tempvcScheema.find({ guild_id: guildId });
    } catch (err) {
        console.error(err);
        return null;
    }
}

/**
 * 
 * @param interaction
 * @param generators 
 * @returns Promise for select row builder
 */
const buildSelector = async (id: string, interaction: Interaction, generators: any[]) => {
    const select = new StringSelectMenuBuilder()
    .setCustomId(id)
    .setPlaceholder('Select a generator')

    const channels = await interaction.guild?.channels.fetch();
    const selectOptions = generators.map((generator, index) => {
        const channelName = channels?.get(generator.generator_id)?.name || "Deleted Channel";
        return new StringSelectMenuOptionBuilder()
            .setLabel(`${index + 1}.- ${channelName}`)
            .setValue(`${generator.generator_id}`)
            .setDescription(`In Category: ${interaction.guild?.channels.cache.get(generator.category_id)?.name || "Deleted Category"} `);
    });

    select.addOptions(selectOptions);
    const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(select);

    return selectRow;
}

const stopCollectors = (selectCollector: InteractionCollector<StringSelectMenuInteraction<CacheType>> | undefined, buttonCollector: InteractionCollector<ButtonInteraction<CacheType>> | undefined) => {
  if (selectCollector) selectCollector.removeAllListeners().stop();
  if (buttonCollector) buttonCollector.removeAllListeners().stop();
}

/**
 * Creates a generator select menu for users if any exist in the interaction's guild.
 * @param interaction Chat command Interation Object.
 * @param callback Code that will execute if generators are found and the user selects one.
 */
const generatorSelect = async (
    interaction: ChatInputCommandInteraction<CacheType>,
    callback: (generatorId: string, generator: any) => Promise<void> | void
  ) => {
  // Get generators and check if there are any.
  const generators = await getGenerators(interaction.guild?.id!);
  
  if (!generators || generators.length < 1) {
    interaction.reply({ content: "This server doesn't have any voice channel generators", ephemeral: true }).catch(console.error);
    return;
  }

  // If there is only one generator, execute the callback with it.
  if (generators.length === 1) {
      const { generator_id, ...generator } = generators[0];
      try {
          await callback(generator_id, generator);
      } catch (err) {
          console.error(err);
      }
      return;
  }

  // Build select menu and cancel button.
  
  const btnRow = new ActionRowBuilder<ButtonBuilder>()
  .addComponents(
    new ButtonBuilder()
    .setCustomId(`cancelselect.${interaction.id}`)
    .setLabel('Cancel')
    .setStyle(ButtonStyle.Danger)
  );

  const generatorEmbed = new EmbedBuilder()
    .setAuthor({ name: 'Aurora Bot', iconURL: interaction.client!.user!.avatarURL()! })
    .setTitle('Generator Select')
    .setDescription("Select a generator you wish to apply this command to.\n**Important:** Deleted generator channels will also appear here.")
    .setColor(config.embeds.colors.main as ColorResolvable)
    .setFooter({ text: config.version })
    .setTimestamp();

  // Create collectors
  const selectCollector = interaction.channel?.createMessageComponentCollector({
    filter: (selectInteraction) => selectInteraction.customId === interaction.id && selectInteraction.user.id === interaction.user.id,
    componentType: ComponentType.StringSelect,
    time: 90_000
  });
  const buttonCollector = interaction.channel?.createMessageComponentCollector({
    filter: (btnInteraction) => btnInteraction.user.id === interaction.user.id,
    componentType: ComponentType.Button
  });

  try {
    const selectRow = await buildSelector(interaction.id, interaction, generators);
    await interaction.reply({ embeds: [generatorEmbed], components: [selectRow, btnRow], ephemeral: true });  
  } catch (err) {
    console.error(err);
    return;
  }

  // The user selected a generator
  selectCollector?.on('collect', async (selectInteraction) => {
    try {
      const selectedValue = selectInteraction.values[0];
      const generator = generators.find((generator) => generator.generator_id === selectedValue);
  
      if (!generator) {
        interaction.editReply({ content: "An error ocurred while trying to find the generator. "}).catch(console.error);
        return;
      }
      
      // Remove all components and execute the callback
      await callback(selectedValue, generator);
      stopCollectors(selectCollector, buttonCollector);
  
      await selectInteraction.deferUpdate();
    } catch (err) {
      console.error(err);
    }
  });

  // The user cancelled the action
  buttonCollector?.on('collect', async (btnInteraction: ButtonInteraction) => {
    try {
      if (btnInteraction.customId !== `cancelselect.${interaction.id}`) return;

      generatorEmbed
        .setTitle('Cancelled')
        .setColor(config.embeds.colors.error as ColorResolvable)
        .setDescription('The action has been cancelled.')
        .setTimestamp();

      await interaction.editReply({ embeds: [generatorEmbed], components: [] });

      stopCollectors(selectCollector, buttonCollector);
      await btnInteraction.deferUpdate();
    } catch (err) {
      console.error(err);
    }
  });

  // On timeout event
  selectCollector?.on('end', async () => {
    try {
      generatorEmbed
      .setTitle('Timeout')
      .setColor(config.embeds.colors.error as ColorResolvable)
      .setDescription('You took too long to complete this action')
      .setTimestamp();

      stopCollectors(selectCollector, buttonCollector);
      await interaction.editReply({ embeds: [generatorEmbed], components: [] });
    } catch (err) {
      console.error(err);
    }
  });
};

export { generatorSelect, buildSelector, getGenerators };