import { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, CacheType, ChatInputCommandInteraction, ColorResolvable, ComponentType, EmbedBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, Interaction } from "discord.js";
import tempvcScheema from "../scheemas/tempvcGeneratorsScheema";
import config from "../config.json";

/**
 * 
 * @param guildId 
 * @returns Promise for the guilds vc generators
 */
const getGenerators = async (guildId: string) => {
    try {
        return await tempvcScheema.find({ guild_id: guildId });
    } catch {
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

    let selectOptions: StringSelectMenuOptionBuilder[] = [];
    for (let [index, generator] of generators.entries()) {
        const channelName = await interaction.guild?.channels.fetch(generator.generator_id).then(channel => channel?.name).catch(() => "Deleted Channel");
        selectOptions.push(
            new StringSelectMenuOptionBuilder()
            .setLabel(`${index + 1}.- ${channelName}`)
            .setValue(`${generator.generator_id}`)
            .setDescription(`In Category: ${interaction.guild?.channels.cache.get(generator.category_id)?.name || "Deleted Category"} `)
        );
    }

    select.addOptions(selectOptions);
    const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(select);

    return selectRow;
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
    await interaction.reply({ content: "This server doesn't have any voice channel generators", ephemeral: true });
    return;
  }

  // If there is only one generator, execute the callback with it.
  if (generators.length === 1) {
      const { generator_id, ...generator } = generators[0];
      await callback(generator_id, generator);
      return;
  }

  // Build select menu and cancel button.
  const selectRow = await buildSelector(interaction.id, interaction, generators);
  const btnRow = new ActionRowBuilder<ButtonBuilder>()
  .addComponents(
    new ButtonBuilder()
    .setCustomId(`cancelselect${interaction.id}`)
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

  await interaction.reply({ embeds: [generatorEmbed], components: [selectRow, btnRow], ephemeral: true });

  // The user selected a generator
  selectCollector?.on('collect', async (selectInteraction) => {
    const selectedValue = selectInteraction.values[0];
    const generator = generators.find((generator) => generator.generator_id === selectedValue);

    await callback(selectedValue, generator);
    selectCollector?.removeAllListeners().stop();
    buttonCollector?.removeAllListeners().stop();

    selectInteraction.deferUpdate();
  });

  // The user cancelled the action
  buttonCollector?.on('collect', async (btnInteraction: ButtonInteraction) => {
    if (btnInteraction.customId !== `cancelselect${interaction.id}`) return;

    generatorEmbed
      .setTitle('Cancelled')
      .setColor(config.embeds.colors.error as ColorResolvable)
      .setDescription('The action has been cancelled.')
      .setTimestamp();

    await interaction.editReply({ embeds: [generatorEmbed], components: [] });

    selectCollector?.removeAllListeners().stop();
    buttonCollector?.removeAllListeners().stop();
    await btnInteraction.deferUpdate();
  });

  // On timeout event
  selectCollector?.on('end', async () => {
    generatorEmbed
      .setTitle('Timeout')
      .setColor(config.embeds.colors.error as ColorResolvable)
      .setDescription('You took too long to complete this action')
      .setTimestamp();

    selectCollector?.removeAllListeners().stop();
    buttonCollector?.removeAllListeners().stop();
    await interaction.editReply({ embeds: [generatorEmbed], components: [] });
  });
};

export { generatorSelect, buildSelector, getGenerators };