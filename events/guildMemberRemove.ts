import { ColorResolvable, EmbedBuilder, Events, Interaction, TextBasedChannel } from "discord.js";
import guildSchema from "../schemas/guildSchema";
import config from "../config.json";

export default {
    name: Events.GuildMemberRemove,
    once: false,
    async execute(interaction: Interaction) {
        // Check if the server the user joined has welcome messages enabled.
        try {
            const guildSettings = await guildSchema.findById(interaction.guild?.id);

            // If the guild is not in the db then do nothing.
            // Check if the guild has goodbye messages enabled.
            if (!guildSettings || !guildSettings.goodbye || !guildSettings.goodbye.goodbye_channel) return;

            // Send a goodbye message in the corresponding channel.
            const channel: TextBasedChannel = interaction.guild?.channels.cache.get(guildSettings.goodbye.goodbye_channel)! as TextBasedChannel;

            let message = guildSettings.goodbye.goodbye_message || `<@${interaction.user.id}> just left the server! Bye 👋`;

            message = message.replace(/{\s*username\s*}/gm, interaction.user.username);
            message = message.replace(/{\s*mention\s*}/gm, `<@${interaction.user.id}>`);
            message = message.replace(/{\s*id\s*}/gm, interaction.user.id);
            message = message.replace(/{\s*server\s*}/gm, interaction.guild!.name);
            message = message.replace(/{\s*members\s*}/gm, interaction.guild!.memberCount.toString());

            const image = guildSettings.goodbye.goodbye_image || null;

            if (guildSettings.goodbye.embed) {
                // Generate the emped
                const welcomeEmbed = new EmbedBuilder()
                    .setAuthor({ name: interaction.guild?.name as string, iconURL: interaction.guild?.iconURL() as string})
                    .setDescription(message)
                    .setColor(config.embeds.colors.main as ColorResolvable)
                    .setImage(image)
                    .setTimestamp()
                
                return await channel.send({ embeds: [welcomeEmbed] });
            }

            await channel.send({ content: message, files: image ? [image] : [] });
        } catch (err) {
            console.error(err);
        }
    }
}