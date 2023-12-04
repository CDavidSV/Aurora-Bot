import { ColorResolvable, EmbedBuilder, Message, PartialMessage, TextChannel, User } from "discord.js";
import config from '../config.json';

/**
 * Deletes messages in bulk
 * @param channel The channel to delete messages from
 * @param count The amount of messages to delete
 * @param user The user who requested the command
 * @param replyMsg The message to reply to
 * @param filterFunc The filter function to apply to the messages
 * @returns An embed with the result of the command
 */
const clearMessages = async (channel: TextChannel, count: number, user: User, replyMsg: Message, filterFunc?: (message: Message | PartialMessage) => boolean): Promise<EmbedBuilder> => {
    // Ignore the first message (sent by bot) by adding 1 to the count
    count += 1;
    let deleteAmmount = count;
    let currentCount = 0;
    let oldMessage = false;
    let deletedMessagesSet = new Set<string>();
    try {
        // Loop through the messages and delete them in bulk
        while (count > 0) {
            // If the count is greater than 100, set the delete ammount to 100
            if (count > 100) deleteAmmount = 100;

            let messages = await channel.messages.fetch({ limit: deleteAmmount, cache: false });
            messages = messages.filter((message: Message | PartialMessage) => message.id !== replyMsg.id && !deletedMessagesSet.has(message.id));
            
            // Apply the filter function if provided
            if (filterFunc) messages = messages.filter((message: Message | PartialMessage) => filterFunc(message));

            const deletedMessages = await channel.bulkDelete(messages, true);

            // Add the deleted messages to the set
            deletedMessages.forEach(message => { if (message) deletedMessagesSet.add(message!.id) });

            // Add the amount of deleted messages to the current count and subtract the amount from the total count
            currentCount += deletedMessages.size;
            console.log(currentCount);
            count -= deletedMessages.size;

            // If the amount of deleted messages is less than the delete ammount, break the loop (means there are no more messages to delete)
            if (deletedMessages.size < deleteAmmount - 1) {
                oldMessage = messages.some(message => Date.now() - message.createdTimestamp >= 604_800)
                break;
            };
        }

        const embed = new EmbedBuilder()
            .setColor(config.embeds.colors.success as ColorResolvable)
            .setAuthor({ name: 'Success', iconURL: config.embeds.images.successImg })
            .setDescription(`Deleted **${currentCount}** messages!`)
            .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL() })
            .setTimestamp();
        
        if (oldMessage) embed.setDescription(`Deleted **${currentCount}** messages!\n\n*Some messages were older than 7 days and could not be deleted.*`)
        
        return embed;
    } catch (error) {
        console.log(error);
        const embed = new EmbedBuilder()
            .setColor(config.embeds.colors.error as ColorResolvable)
            .setAuthor({ name: 'Failed', iconURL: config.embeds.images.errorImg })
            .setDescription(`Failed to delete messages`)
            .setFooter({ text: `Requested by ${user.tag}`, iconURL: user.displayAvatarURL() })
            .setTimestamp();
        
        return embed;
    }
}

export default clearMessages;