import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder, PermissionFlagsBits, Role, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";
import guildSchema from "../../../schemas/guildSchema";
import config from "../../../config.json";

const confirmDeleteRole = async (interaction: StringSelectMenuInteraction, role: string) => {
    // Show confirmation and canmcels buttons.
    const confirmButton = new ButtonBuilder()
        .setCustomId(`confirmDelete.${interaction.id}`)
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success);
    const cancelButton = new ButtonBuilder()
        .setCustomId(`cancelDelete.${interaction.id}`)
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger);

    // Create the action row.
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(confirmButton, cancelButton);
    
    // Edit the original message to show the buttons.
    const confirmationEmbed = new EmbedBuilder()
        .setAuthor({ name: 'Remove autorole' })
        .setColor(config.embeds.colors.warning as ColorResolvable)
        .setDescription(`Are you sure you want to remove the role <@&${role}> from the autorole list?`);

    await interaction.update({ embeds: [confirmationEmbed], components: [row] });
    const BtnCollector = interaction.channel?.createMessageComponentCollector({ filter: (buttonInteraction) => buttonInteraction.user.id === interaction.user.id, time: 90_000 });
    
    BtnCollector?.on('collect', async (buttonInteraction) => {
        if (buttonInteraction.customId !== `confirmDelete.${interaction.id}` && buttonInteraction.customId !== `cancelDelete.${interaction.id}`) return;

        BtnCollector?.removeAllListeners().stop();
        if (buttonInteraction.customId === `confirmDelete.${interaction.id}`) {
            // Remove the role from the autorole list.
            try {
                await guildSchema.findByIdAndUpdate(interaction.guildId, { $pull: { autorole: role } }, { new: true });
                const successEmbed = new EmbedBuilder()
                    .setAuthor({ name: `Role removed`, iconURL: config.embeds.images.successImg })
                    .setDescription(`The role <@&${role}> has been removed from the autorole list`)
                    .setColor(config.embeds.colors.success as ColorResolvable)
                await buttonInteraction.update({ embeds: [successEmbed], components: [] });
            } catch {
                const errorEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Unnable to remove the role from the autorole list', iconURL: config.embeds.images.errorImg })
                    .setColor(config.embeds.colors.error as ColorResolvable)
                buttonInteraction.update({ embeds: [errorEmbed], components: [] }).catch(() => console.error);
            }
        } else {
            const cancelledEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Cancelled', iconURL: config.embeds.images.successImg })
                .setColor(config.embeds.colors.success as ColorResolvable)
                .setDescription('The role was not removed from the autorole list');
            interaction.editReply({ embeds: [cancelledEmbed], components: [] }).catch(() => console.error);
        }
    });

    BtnCollector?.on('end', async () => {
        BtnCollector?.removeAllListeners().stop();
        const errorEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Action timeout', iconURL: config.embeds.images.errorImg })
            .setColor(config.embeds.colors.error as ColorResolvable)
            .setDescription('You took too long to respond. The role was not removed from the autorole list');
        await interaction.editReply({ embeds: [errorEmbed], components: [] });
    });
};

export default {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('🏷️ Manage roles that are added when a user joins the server')
        .setDMPermission(false)
        .addSubcommand(subCommand => 
            subCommand
                .setName('add')
                .setDescription('🏷️ Add a role that will be added to users that join this server')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role that will be added to the user that joins')
                        .setRequired(true)))
        .addSubcommand(subCommand =>
            subCommand
                .setName('remove')
                .setDescription('❌ Remove a role that is added to users that join this server'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    botPerms: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageRoles],
    callback: async (interaction: ChatInputCommandInteraction) => {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'add':
                const role = interaction.options.getRole('role', true);

                const successEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Role Added', iconURL: config.embeds.images.successImg })
                    .setDescription(`The role <@&${role.id}> has been added to the autorole list`)
                    .setColor(config.embeds.colors.success as ColorResolvable)

                const errorEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Unnable to add the role to the autorole list', iconURL: config.embeds.images.errorImg })
                    .setColor(config.embeds.colors.error as ColorResolvable)

                try {
                    // Check if the guild is saved in the database.
                    const guildData = await guildSchema.findById(interaction.guildId);
                    if(!guildData) {
                        await guildSchema.create({ _id: interaction.guildId, autorole: [role.id] });

                        return await interaction.reply({ embeds: [successEmbed], ephemeral: true });
                    } else if (guildData.autorole.length === 3) {
                        const responseEmbed = new EmbedBuilder()
                            .setAuthor({ name: 'You have reached the limit of autoroles', iconURL: config.embeds.images.errorImg })
                            .setColor(config.embeds.colors.error as ColorResolvable)
                            .setDescription('You can only have a maximum of 3 autoroles');
                        return await interaction.reply({ embeds: [responseEmbed], ephemeral: true });
                    }
                    guildData?.autorole.push(role.id);
                    await guildData.save();
                    await interaction.reply({ embeds: [successEmbed], ephemeral: true });
                } catch (err) {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
                break;
            case 'remove':
                const guildData = await guildSchema.findById(interaction.guildId);
                if (!guildData || !guildData.autorole || guildData.autorole.length < 1) {
                    const errorEmbed = new EmbedBuilder()
                        .setAuthor({ name: 'There are no autoroles set for this server', iconURL: config.embeds.images.errorImg })
                        .setColor(config.embeds.colors.error as ColorResolvable)

                    interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => console.error);
                    return;
                }

                let rolesToRemove: Role[] = [];
                for (let roleId of guildData.autorole) {
                    const role = interaction.guild?.roles.cache.get(roleId);
                    if (role) rolesToRemove.push(role);
                }

                const roleOptions = rolesToRemove.map((role: Role) => {
                    return {
                        label: role.name,
                        description: `ID: ${role.id}`,
                        value: `${role.id}`,
                    };
                });
                
                const roleSelect = new StringSelectMenuBuilder()
                    .setCustomId(`removeAutorole.${interaction.id}`)
                    .setPlaceholder('Select a role to remove')
                    .addOptions(roleOptions);
                
                const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(roleSelect);
                
                const responseEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Remove autorole' })
                    .setColor(config.embeds.colors.warning as ColorResolvable)
                    .setDescription('Select a role to remove from the autorole list');

                await interaction.reply({ embeds: [responseEmbed], components: [row], ephemeral: true });

                // Await the interaction response from user (2 minutes)
                const collector = interaction.channel?.createMessageComponentCollector({ filter: (selectInteraction) => selectInteraction.user.id === interaction.user.id && selectInteraction.customId === `removeAutorole.${interaction.id}`, time: 90_000  });

                collector?.on('collect', async (selectInteraction: StringSelectMenuInteraction) => {
                    try {
                        collector?.removeAllListeners().stop();
                        await confirmDeleteRole(selectInteraction, selectInteraction.values[0]);
                    } catch (error) {
                        console.error('Error within confirmDeleteRole:', error);
                    }
                });

                collector?.on('end', async () => {
                    collector?.removeAllListeners().stop();
                    const errorEmbed = new EmbedBuilder()
                        .setAuthor({ name: 'Action timeout', iconURL: config.embeds.images.errorImg })
                        .setColor(config.embeds.colors.error as ColorResolvable)
                        .setDescription('You took too long to respond. The role was not removed from the autorole list');
                    await interaction.editReply({ embeds: [errorEmbed], components: [] });
                });
                break;
        }
    }
}