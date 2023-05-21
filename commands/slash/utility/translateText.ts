import { AutocompleteInteraction, CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import { translateString, langCodes } from "../../../util/translate";
import config from "../../../config.json";

export default {
    subCommand: "utility.translate.text",
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {
        await interaction.deferReply();
        
        const targetLanguage = interaction.options.getString('language') || 'en';
        const text = interaction.options.getString('text');

        // Translate text.
        translateString(text!, targetLanguage).then(async (respose) => {          
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
        const focusedValue = interaction.options.getFocused().toLowerCase();

        let choices: string[] = [];
        let keys: string[] = [];
        for (let key in langCodes) {
            choices.push(langCodes[key]);
            keys.push(key);
        }

        let filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedValue));

        if (filtered.length > 25) {
            filtered = filtered.slice(0, 25);
        }

        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: keys[choices.indexOf(choice)] }))
        );
    }
}