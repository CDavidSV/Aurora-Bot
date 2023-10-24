import { CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import { getImageText, isImage } from "../../../util/image-to-text";
import config from "../../../config.json";

export default {
    subCommand: "utility.ocr",
    callback: async (interaction:  ChatInputCommandInteraction<CacheType>) => {
        await interaction.deferReply();
        const image = interaction.options.getAttachment('image', true);

        if (!isImage(image)) {
            await interaction.followUp({ content: "Attachment is not an Image", ephemeral: true })
            return;
        }
        
        const imageText = await getImageText(image.url);

        if (!imageText) {
            await interaction.followUp({ content: "An Error ocurred while processing the image, please try again.", ephemeral: true })
            return;
        }

        const imageToTextEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Aurora Bot', iconURL: interaction.client!.user!.avatarURL()! })
            .setColor(config.embeds.colors.main as ColorResolvable)
            .setDescription("**Text:\n** ```" + imageText + "```")
            .setImage(image.url)
            .setFooter({ text: `${config.version} • Powered by Google` })
        
        await interaction.followUp({ embeds: [imageToTextEmbed] });
    }
}