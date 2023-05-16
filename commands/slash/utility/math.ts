import { CacheType, ChatInputCommandInteraction, ColorResolvable, EmbedBuilder } from "discord.js";
import { evaluate } from "mathjs";
import config from "../../../config.json";

export default {
    subCommand: "utility.math",
    callback: async (interaction: ChatInputCommandInteraction<CacheType>) => {
        const expression = interaction.options.getString("expression")!;
        const mathRegex = /^(?:[\d]+[.][\d]+|[\d]+|\+|\-|\*|\/|\^|\(|\)|sin+|cos+|tan+|E+|LN10+|e+|ln10+|ln2+|LN2+|LOG2E+|log2e+|pi+|PI+|SQRT1_2+|sqrt1_2+|SQRT2+|sqrt2+|abs+|acos+|acosh+|asin+|asinh+|atan+|atan2+|atanh+|cbrt+|ceil+|clz32+|cosh+|exp+|expm1+|floor+|fround+|hypot+|imul+|log+|log10+|log1p+|log2+|max+|min+|pow+|random+|round+|sign+|sinh+|sqrt+|tanh+|trunc+|det+| )+$/g;

        if (!mathRegex.test(expression)) {
            await interaction.reply({content: `Incorrect math expression for: **${expression}**`});
            return;
        }  

        try {
            const result = evaluate(expression);
            const mathEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Aurora Calculator', iconURL: interaction.client!.user!.avatarURL()! })
                .setColor(config.embeds.colors.main as ColorResolvable)
                .addFields(
                    { name: "Math Expression: ", value: "```css\n" + expression + " \n```"},
                    { name: "Answer: ", value: "```css\n" + result.toString() + " \n```"}
                )
                .setFooter({ text: config.version })
            await interaction.reply({ embeds: [mathEmbed] });

        } catch {
            await interaction.reply({content: `Incorrect math expression for: **${expression}**`});
        }
    }
}