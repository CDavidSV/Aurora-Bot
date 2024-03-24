import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

interface PageData {
    page: number;
    pages: number;
}

export default class PaginationButtonHandler {
    private currentPage: number;
    private pages: number;
    private paginationButtons: ActionRowBuilder<ButtonBuilder>;

    constructor(page: number, pages: number) {
        this.pages = pages;

        if (page > this.pages) {
            this.currentPage = this.pages;
        }
        this.currentPage = page - 1;
        
        // Build Buttons.
        this.paginationButtons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder().setCustomId('first').setEmoji('1221259703481270373').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('previous').setEmoji('1133857717027614811').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('stop').setEmoji('1133857126478008430').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('next').setEmoji('1133857705241620530').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('last').setEmoji('1221259687932989542').setStyle(ButtonStyle.Primary)
        ]);

        this.updateButtonState();
    }

    updateButtonState() {
        // Check the current page and update the enabled and dissable buttons.
        if (this.pages === 1 || this.pages === 0) {
            this.paginationButtons.components[0].setDisabled(true);
            this.paginationButtons.components[1].setDisabled(true);
            this.paginationButtons.components[3].setDisabled(true);
            this.paginationButtons.components[4].setDisabled(true);
        } else if (this.currentPage === 0) {
            this.paginationButtons.components[0].setDisabled(true);
            this.paginationButtons.components[1].setDisabled(true);
            this.paginationButtons.components[3].setDisabled(false);
            this.paginationButtons.components[4].setDisabled(false);
        } else if (this.currentPage >= this.pages - 1) {
            this.paginationButtons.components[0].setDisabled(false);
            this.paginationButtons.components[1].setDisabled(false);
            this.paginationButtons.components[3].setDisabled(true);
            this.paginationButtons.components[4].setDisabled(true);
        } else {
            this.paginationButtons.components[0].setDisabled(false);
            this.paginationButtons.components[1].setDisabled(false);
            this.paginationButtons.components[3].setDisabled(false);
            this.paginationButtons.components[4].setDisabled(false);
        }
    }

    setCurrentPage(page: number) {
        this.currentPage = page;
        this.updateButtonState();
    }

    setTotalPages(pages: number) {
        this.pages = pages;

        if (this.pages < 0) {
            this.pages = 0;
        }

        if (this.currentPage >= this.pages) {
            this.currentPage = this.pages;
        }

        this.updateButtonState();
    }

    getButtons() {
        return this.paginationButtons;
    }

    getCurrentPageNumber() {     
        return this.currentPage;
    }

    getTotalPages() {
        return this.pages;
    }

    decreasePage() {
        this.currentPage--;
        this.updateButtonState();
    }

    increasePage() {
        this.currentPage++;
        this.updateButtonState();
    }

    lastPage() {
        this.currentPage = this.pages - 1;
        this.updateButtonState();
    }

    firstPage() {
        this.currentPage = 0;
        this.updateButtonState();
    }

    getPageOnButtonId(buttonId: string): { page: number, pages: number, buttons: ActionRowBuilder<ButtonBuilder> } | null {
        switch (buttonId) {
            case 'next':
                this.increasePage();
                break;
            case 'previous':
                this.decreasePage();
                break;
            case 'stop':
                return null;
            case 'first':
                this.firstPage();
                break;
            case 'last':
                this.lastPage();
                break;
            default:
                return null;
        }

        this.updateButtonState();
        return { page: this.currentPage, pages: this.pages, buttons: this.paginationButtons };
    }
}