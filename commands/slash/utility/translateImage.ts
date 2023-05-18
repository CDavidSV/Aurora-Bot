import { AutocompleteInteraction, CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import { validateImageFormat, getImageText } from "../../../util/image-to-text"
import { langCodes, translateString } from "../../../util/translate";
import config from "../../../config.json";

export default {
    subCommand: "utility.translate.image",
    callback: async (interaction:  ChatInputCommandInteraction<CacheType>) => {
        await interaction.deferReply();
        const image = interaction.options.getAttachment('image', true);

        if (!validateImageFormat(image?.url)) {
            await interaction.followUp({ content: "Attachment is not an Image", ephemeral: true })
            return;
        }
        
        const imageText = await getImageText(image.url);

        if (!imageText) {
            await interaction.followUp({ content: "An Error Ocurred while processing the image, please try again.", ephemeral: true })
            return;
        }

        const targetLanguage = interaction.options.getString('language') || 'en';
        
        // Translate text.
        translateString(imageText, targetLanguage).then(async (respose) => {          
            const translateEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Aurora Translator', iconURL: interaction.client!.user!.avatarURL()! })
                .setDescription(`\`${respose[0]}\``)
                .setColor(config.embeds.colors.main as ColorResolvable)
                .addFields(
                    { name: 'Detected Langauge:', value: langCodes[respose[1]], inline: true },
                    { name: 'Translated to: ', value: langCodes[targetLanguage], inline: true }
                )
                .setFooter({ text: `${config.version} • Powered by Google` })

            await interaction.followUp({ embeds: [translateEmbed] });
        }).catch(async () => {
            await interaction.followUp("An error ocurred while translating this text. Please try again later.");
        });
    },
    autoComplete: async (interaction: AutocompleteInteraction) => {
        const focusedValue = interaction.options.getFocused();

        let choices: string[] = [];
        let keys: string[] = [];
        for (let key in langCodes) {
            choices.push(langCodes[key]);
            keys.push(key);
        }

        let filtered = choices.filter(choice => choice.startsWith(focusedValue));

        if (filtered.length > 25) {
            filtered = filtered.slice(0, 25);
        }

        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: keys[choices.indexOf(choice)] }))
        );
    }
}