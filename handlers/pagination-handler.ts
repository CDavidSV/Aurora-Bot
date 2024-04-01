import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from "discord.js";
import PaginationButtonHandler from "./pagination-button-handler";

export class PaginationHandler {
    private embeds: EmbedBuilder[];
    private buttonHandler: PaginationButtonHandler;

    constructor(embeds: EmbedBuilder[], page: number = 1) { 
        this.embeds = embeds;
        this.buttonHandler = new PaginationButtonHandler(page, embeds.length);
    }

    getPageNumber(): string {
        return `Page **${this.buttonHandler.getCurrentPageNumber() + 1}** of **${this.buttonHandler.getTotalPages()}**`;
    }

    updateEmbeds(newEmbedsList: EmbedBuilder[]) {
        this.embeds = newEmbedsList;
        this.buttonHandler.setTotalPages(this.embeds.length);

        if (this.buttonHandler.getCurrentPageNumber() >= this.buttonHandler.getTotalPages() - 1) {
            this.buttonHandler.setCurrentPage(this.buttonHandler.getTotalPages() - 1);
        }
    }

    getCurrentEmbed(): EmbedBuilder {
        return this.embeds[this.buttonHandler.getCurrentPageNumber()];
    }

    getButtons(): ActionRowBuilder<ButtonBuilder> {
        return this.buttonHandler.getButtons();
    }

    nextPage(): { pageNumber: string ,embed: EmbedBuilder, buttons: ActionRowBuilder<ButtonBuilder> } {
        if (this.buttonHandler.getCurrentPageNumber() >= this.buttonHandler.getTotalPages() - 1) {
            return { pageNumber: this.getPageNumber(), embed: this.embeds[-1], buttons: this.buttonHandler.getButtons() };
        }

        this.buttonHandler.increasePage();
        return { pageNumber: this.getPageNumber(), embed: this.embeds[this.buttonHandler.getCurrentPageNumber()], buttons: this.buttonHandler.getButtons() };
    }

    previousPage(): { pageNumber: string ,embed: EmbedBuilder, buttons: ActionRowBuilder<ButtonBuilder> } {
        if (this.buttonHandler.getCurrentPageNumber() === 0) {
            return { pageNumber: this.getPageNumber(), embed: this.embeds[this.buttonHandler.getCurrentPageNumber()], buttons: this.buttonHandler.getButtons() };
        }

        this.buttonHandler.decreasePage();
        return { pageNumber: this.getPageNumber(), embed: this.embeds[this.buttonHandler.getCurrentPageNumber()], buttons: this.buttonHandler.getButtons() };
    }

    lastPage(): { pageNumber: string ,embed: EmbedBuilder, buttons: ActionRowBuilder<ButtonBuilder> } {
        this.buttonHandler.lastPage();

        return { pageNumber: this.getPageNumber(), embed: this.embeds[this.buttonHandler.getCurrentPageNumber()], buttons: this.buttonHandler.getButtons() };
    }

    firstPage(): { pageNumber: string ,embed: EmbedBuilder, buttons: ActionRowBuilder<ButtonBuilder> } {
        this.buttonHandler.firstPage();

        return { pageNumber: this.getPageNumber(), embed: this.embeds[this.buttonHandler.getCurrentPageNumber()], buttons: this.buttonHandler.getButtons() };
    }

    getPage(page: number): { pageNumber: string ,embed: EmbedBuilder, buttons: ActionRowBuilder<ButtonBuilder> } {
        // Cases where the page is out of bounds.
        if (page >= this.buttonHandler.getTotalPages()) {
            this.buttonHandler.lastPage();
            return { pageNumber: this.getPageNumber(), embed: this.embeds[-1], buttons: this.buttonHandler.getButtons() };
        }
        if (page <= 1) {
            this.buttonHandler.firstPage();
            return { pageNumber: this.getPageNumber(), embed: this.embeds[0], buttons: this.buttonHandler.getButtons() };
        }

        return { pageNumber: this.getPageNumber(), embed: this.embeds[page - 1], buttons: this.buttonHandler.getButtons() };
    }

    getPageOnButtonId(buttonId: string): { pageNumber: string ,embed: EmbedBuilder, buttons: ActionRowBuilder<ButtonBuilder> } | null {
        const pageData = this.buttonHandler.getPageOnButtonId(buttonId);
        if (!pageData) return null;

        return { pageNumber: this.getPageNumber(), embed: this.embeds[pageData.page], buttons: pageData.buttons };
    }
}