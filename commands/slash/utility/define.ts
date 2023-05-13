import axios from "axios";
import { CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import config from "../../../config.json";

interface Definition {
    definition: string,
    example: string,
    synonyms: string[],
    antonyms: string[]
}

interface Meaning {
    partOfSpeech: string,
    definitions: Definition[]
}

export default {
    subCommand: "utility.define",
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {
        const APIURL = "https://api.dictionaryapi.dev/api/v2/entries/en";

        await interaction.deferReply();

        // Get the definition.
        axios.get(`${APIURL}/${interaction.options.getString('word')}`)
        .then(response => {
            const definitionEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Marin Bot', iconURL: interaction.client!.user!.avatarURL()! })
                .setTitle(`Definition for *${interaction.options.getString('word')}*`)
                .setColor(config.embeds.colors.main as ColorResolvable)
                
                response.data[0].meanings.forEach((meaning: Meaning, i: number) => {
                    if (meaning.definitions[0].example) {
                        definitionEmbed.addFields({ name: meaning.partOfSpeech, value: `${i + 1}. ${meaning.definitions[0].definition}\n\`${meaning.definitions[0].example}\`\n`});
                    } else {
                        definitionEmbed.addFields({ name: meaning.partOfSpeech, value: `${i + 1}. ${meaning.definitions[0].definition}\n`});
                    }
                });
                definitionEmbed.addFields({ name: '\n', value: '\n' });

                definitionEmbed
                    .addFields(
                        { name: "Phoenetic", value: response.data[0].phonetic },
                    )
                .setFooter({ text: config.version })

                if (response.data[0].origin) {
                    definitionEmbed.addFields({ name: "Origin" , value: response.data[0].origin });
                }
            
            interaction.followUp({embeds: [definitionEmbed]});
        })
        .catch((err) => {
            interaction.followUp({ content: `No definitions found for "*${interaction.options.getString('word')}*"`, ephemeral: true});
        });
    },
}