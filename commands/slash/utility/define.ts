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
                .setAuthor({ name: 'Aurora Bot', iconURL: interaction.client!.user!.avatarURL()! })
                .setTitle(`Definition for *${interaction.options.getString('word')}*`)
                .setColor(config.embeds.colors.main as ColorResolvable)
                
                response.data[0].meanings.forEach((meaning: Meaning, i: number) => {
                    let count = 0;
                    let definitions = "";
                    while(count < 3 && meaning.definitions[count]) {
                        if (meaning.definitions[count].example) {
                            definitions += `​ ​ ​ ​​${count + 1}. ${meaning.definitions[count].definition}\n​​ ​ ​ ​\`${meaning.definitions[count].example}\`\n\n`;
                        } else {
                            definitions += `​​ ​ ​ ​ ${count + 1}. ${meaning.definitions[count].definition}\n\n`;
                        }
                        count++;
                    }
                    definitionEmbed.addFields({ name: meaning.partOfSpeech, value: definitions});
                });
                definitionEmbed.addFields({ name: '\n', value: '\n' });

                if (response.data[0].phonetic) {
                    definitionEmbed.addFields({ name: "Phonetic", value: response.data[0].phonetic })
                }

                if (response.data[0].origin) {
                    definitionEmbed.addFields({ name: "Origin" , value: response.data[0].origin });
                }
            
            definitionEmbed.setFooter({ text: config.version })
            interaction.followUp({embeds: [definitionEmbed]});
        })
        .catch((err) => {
            interaction.followUp({ content: `No definitions found for "*${interaction.options.getString('word')}*"`, ephemeral: true});
        });
    },
}