import { APIEmbedField, ColorResolvable, EmbedBuilder } from "discord.js";

interface PageFields {
    title?: string | null,
    description?: string | null,
    fields?: APIEmbedField[] | null,
    color?: ColorResolvable | null,
    thumbnail?: string | null,
}

/**
 * 
 * @param itemsList     List of items to paginate.
 * @param quantity      Quantity of items per page.
 * @param options       Embed options.
 * @returns        An array of embeds.
 */
const paginate = (itemsList: string[], quantity: number = 10, options: PageFields) => {
    if (itemsList.length === 0) throw new Error('No items');

    let embeds: EmbedBuilder[] = [];
    const embedQuantity = Math.ceil(itemsList.length / quantity);

    const pages = itemsList.reduce((acc, item, i) => {
        if (i % quantity === 0) acc.push([]);
        acc[acc.length - 1].push(item);
        return acc;
    }, [] as string[][]);

    const embed = new EmbedBuilder()
        .setTitle(options.title || null)
        .addFields(options.fields || [])
        .setColor(options.color || null)
        .setThumbnail(options.thumbnail || null)

    let count = 1;
    for (let i = 0; i < embedQuantity; i++) {
        let items = options.description && options.description.length !== 0 ? `${options.description}\n\n` : '';

        for (let item of pages[i]) {
            items += `\`${count}\` ${item}\n`;
            count++;
        }
        embed.setDescription(items);

        embeds.push(embed);
    }

    return embeds;
}

export { paginate, PageFields };