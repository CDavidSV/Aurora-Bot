import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ColorResolvable, APIEmbedField, Message, APIActionRowComponent, APIMessageActionRowComponent, ActionRowData, JSONEncodable, MessageActionRowComponentBuilder, MessageActionRowComponentData } from "discord.js";

interface PaginateOptions {
    quantity?: number | null,
    title?: string | null,
    description?: string | null,
    fields?: APIEmbedField[] | null,
    color?: ColorResolvable | null,
    thumbnail?: string | null,
}

enum ReplyType {
    REPLY = 'reply',
    EDIT = 'edit'
}

const handlePagination = async (interaction: ChatInputCommandInteraction, embeds: EmbedBuilder[], replyType: ReplyType, extraComponents: (| JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>| ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder>| APIActionRowComponent<APIMessageActionRowComponent>)[] = [], page = 1, timeout = 900_000) => {
    if (embeds.length < 1) throw new Error('No embeds to paginate.');
    if (page - 1 > embeds.length - 1 || page <= 0) throw new Error('Page out of range.');

    // Buttons.
    const paginationButtons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents([
        new ButtonBuilder().setCustomId(`previous${interaction.id}`).setEmoji('1133857717027614811').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`stop${interaction.id}`).setEmoji('1133857126478008430').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`next${interaction.id}`).setEmoji('1133857705241620530').setStyle(ButtonStyle.Primary)
    ]);

    // Current index for the embeds array.
    let currentIndex = page - 1;

    if (embeds.length === 1) {
        paginationButtons.components[0].setDisabled(true);
        paginationButtons.components[2].setDisabled(true);
    } else if (currentIndex === 0) {
        paginationButtons.components[0].setDisabled(true);
    } else if (currentIndex === embeds.length - 1){
        paginationButtons.components[2].setDisabled(true);
    }

    let replyMsg: Message<boolean>;
    switch (replyType) {
        case ReplyType.REPLY:
            replyMsg = await interaction.reply({ embeds: [embeds[page - 1]], components: [...extraComponents, paginationButtons], fetchReply: true });
            break;
        case ReplyType.EDIT:
            replyMsg = await interaction.editReply({ embeds: [embeds[page - 1]], components: [...extraComponents, paginationButtons] });
            break;
    }
    
    // Pagination button colletor.
    const collector = interaction.channel!.createMessageComponentCollector({
        filter: (buttonInteraction) => [`next${interaction.id}`, `previous${interaction.id}`, `stop${interaction.id}`].includes(buttonInteraction.customId),
        time: timeout
    });

    setTimeout(async () => {
        paginationButtons.components[0].setDisabled(true); 
        paginationButtons.components[1].setDisabled(true);

        await replyMsg.edit({ components: [paginationButtons] }).catch(console.error);
    }, timeout); // Clear after specified ammount of time.

    collector.on('collect', async (buttonInteraction) => {
        switch (buttonInteraction.customId) {
            case `next${interaction.id}`:
                if (currentIndex === embeds.length - 1) {
                    buttonInteraction.deferUpdate().catch(console.error);
                    return;
                }

                paginationButtons.components[0].setDisabled(false); 
                if (currentIndex + 1 >= embeds.length - 1) {
                    paginationButtons.components[2].setDisabled(true);
                }

                currentIndex++;
                replyMsg.edit({ embeds: [embeds[currentIndex]], components: [...extraComponents, paginationButtons] }).catch(console.error);
                break;
            case `previous${interaction.id}`:
                if (currentIndex === 0) {
                    buttonInteraction.deferUpdate().catch(console.error);
                    return;
                }

                paginationButtons.components[2].setDisabled(false);
                if (currentIndex - 1 <= 0) {
                    paginationButtons.components[0].setDisabled(true);
                }

                currentIndex--;
                replyMsg.edit({ embeds: [embeds[currentIndex]], components: [...extraComponents, paginationButtons] }).catch(console.error);
                break;
            case `stop${interaction.id}`:
                await replyMsg.delete().catch(console.error);
                collector.stop();
                break;
        }
        buttonInteraction.deferUpdate().catch(console.error);
    });

    return { collector, replyMsg };
}

const paginate = (itemsList: string[], options: PaginateOptions) => {
    if (itemsList.length === 0) throw new Error('No items');
    
    const quantity = options.quantity || 10;

    let embeds: EmbedBuilder[] = [];
    const embedQuantity = Math.ceil(itemsList.length / quantity);

    const pages = [];
    for (let i = 0; i < itemsList.length; i += quantity) {
        pages.push(itemsList.slice(i, i + quantity));
    }

    let count = 1;
    for (let i = 0; i < embedQuantity; i++) {
        let items = options.description && options.description.length !== 0 ? `${options.description}\n\n` : '';
        const embed = new EmbedBuilder()
            .setTitle(options.title || null)
            .addFields(options.fields || [])
            .setColor(options.color || null)
            .setThumbnail(options.thumbnail || null)
        
        if (embedQuantity > 1) embed.setFooter({ text: `Page ${i + 1} of ${embedQuantity}` });

        for (let item of pages[i]) {
            items += `\`${count}\` ${item}\n`;
            count++;
        }
        embed.setDescription(items);

        embeds.push(embed);
    }

    return embeds;
}

export { paginate, handlePagination, PaginateOptions, ReplyType };