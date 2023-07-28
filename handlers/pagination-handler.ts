import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ColorResolvable, APIEmbedField, Message, APIActionRowComponent, APIMessageActionRowComponent, ActionRowData, JSONEncodable, MessageActionRowComponentBuilder, MessageActionRowComponentData, InteractionResponse, InteractionEditReplyOptions, MessageEditOptions, Embed } from "discord.js";

export class PaginationHandler {
    private id: string;
    private embeds: EmbedBuilder[];
    private pages: number;
    private currentPage: number;
    private paginationButtons: ActionRowBuilder<ButtonBuilder>;

    constructor(interactionId: string, embeds: EmbedBuilder[], page: number = 1) { 
        this.embeds = embeds;
        this.pages = embeds.length;
        this.id = interactionId;

        if (page > this.pages) {
            throw new Error('Page number is greater than the number of pages.');
        }
        this.currentPage = page - 1;
        
        // Build Buttons.
        this.paginationButtons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder().setCustomId(`previous.${this.id}`).setEmoji('1133857717027614811').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`stop.${this.id}`).setEmoji('1133857126478008430').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`next.${this.id}`).setEmoji('1133857705241620530').setStyle(ButtonStyle.Primary)
        ]);

        this.updateButtonState();
    }

    getId(): string {
        return this.id;
    }

    private updateButtonState() {
        // Check the current page and update the enabled and dissable buttons.
        if (this.pages === 1) {
            this.paginationButtons.components[0].setDisabled(true);
            this.paginationButtons.components[2].setDisabled(true);
        } else if (this.currentPage === 0) {
            this.paginationButtons.components[0].setDisabled(true);
            this.paginationButtons.components[2].setDisabled(false);
        } else if (this.currentPage === this.pages - 1) {
            this.paginationButtons.components[0].setDisabled(false);
            this.paginationButtons.components[2].setDisabled(true);
        } else {
            this.paginationButtons.components[0].setDisabled(false);
            this.paginationButtons.components[2].setDisabled(false);
        }
    }

    updateEmbeds(newEmbedsList: EmbedBuilder[]) {
        this.embeds = newEmbedsList;
        this.pages = this.embeds.length;

        this.updateButtonState();
    }

    getCurrentEmbed(): EmbedBuilder {
        return this.embeds[this.currentPage];
    }

    getButtons(): ActionRowBuilder<ButtonBuilder> {
        return this.paginationButtons;
    }

    nextPage(): { pageNumber: string ,embed: EmbedBuilder, buttons: ActionRowBuilder<ButtonBuilder> } {
        if (this.currentPage >= this.pages - 1) {
            this.currentPage = this.pages - 1;
            this.updateButtonState();
            return { pageNumber: `Page **${this.currentPage + 1}** of **${this.pages}**`, embed: this.embeds[-1], buttons: this.paginationButtons };
        }

        this.currentPage++;
        this.updateButtonState();
        return { pageNumber: `Page **${this.currentPage + 1}** of **${this.pages}**`, embed: this.embeds[this.currentPage], buttons: this.paginationButtons };
    }

    previousPage(): { pageNumber: string ,embed: EmbedBuilder, buttons: ActionRowBuilder<ButtonBuilder> } {
        if (this.currentPage === 0) {
            return { pageNumber: `Page **${this.currentPage + 1}** of **${this.pages}**`, embed: this.embeds[this.currentPage], buttons: this.paginationButtons };
        }

        this.currentPage--;
        this.updateButtonState();
        return { pageNumber: `Page **${this.currentPage + 1}** of **${this.pages}**`, embed: this.embeds[this.currentPage], buttons: this.paginationButtons };
    }

    getPage(page: number): { pageNumber: string ,embed: EmbedBuilder, buttons: ActionRowBuilder<ButtonBuilder> } {
        // Cases where the page is out of bounds.
        if (page >= this.pages) {
            this.paginationButtons.components[0].setDisabled(false);
            this.paginationButtons.components[2].setDisabled(true);

            this.currentPage = this.pages - 1;
            return { pageNumber: `Page **${this.currentPage + 1}** of **${this.pages}**`, embed: this.embeds[-1], buttons: this.paginationButtons };
        }
        if (page <= 1) {
            this.paginationButtons.components[0].setDisabled(true);
            this.paginationButtons.components[2].setDisabled(false);

            this.currentPage = 0;
            return { pageNumber: `Page **${this.currentPage + 1}** of **${this.pages}**`, embed: this.embeds[0], buttons: this.paginationButtons };
        }

        this.updateButtonState();
        return { pageNumber: `Page **${this.currentPage + 1}** of **${this.pages}**`, embed: this.embeds[page - 1], buttons: this.paginationButtons };
    }

    getPageOnButtonId(buttonId: string): { pageNumber: string ,embed: EmbedBuilder, buttons: ActionRowBuilder<ButtonBuilder> } | null {
        switch (buttonId) {
            case `next.${this.id}`:
                return this.nextPage();
            case `previous.${this.id}`:
                return this.previousPage();
            case `stop.${this.id}`:
                return null;
            default:
                throw new Error('Invalid button id');
        }
    }
}