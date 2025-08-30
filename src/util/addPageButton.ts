import { Card } from "kasumi.js";

export const addPageButton = (card: Card, pageInfo: { page: number, page_total: number }, eventName: string[]): Card => {
    const currentPage = pageInfo.page;
    const totalPages = pageInfo.page_total;

    const pageInfoLast = [eventName[0], String(currentPage)].join(',');
    const pageInfoNext = [eventName[1], String(currentPage)].join(',');

    card.addText(`当前第 ${currentPage} 页，共 ${totalPages} 页。`);

    const buttonLast = {
        type: Card.Parts.AccessoryType.BUTTON,
        text: {
            type: Card.Parts.TextType.PLAIN_TEXT,
            content: "上一页",
        },
        theme: Card.Theme.INFO,
        value: pageInfoLast,
        click: Card.Parts.ButtonClickType.RETURN_VALUE,
    }
    const buttonNext = {
        type: Card.Parts.AccessoryType.BUTTON,
        text: {
            type: Card.Parts.TextType.PLAIN_TEXT,
            content: "下一页",
        },
        theme: Card.Theme.INFO,
        value: pageInfoNext,
        click: Card.Parts.ButtonClickType.RETURN_VALUE,
    }

    var buttons = [buttonLast, buttonNext];
    if (currentPage <= 1) {
        buttons = [buttonNext]
    }
    if (currentPage >= totalPages) {
        buttons = [buttonLast]
    }
    if (currentPage == 1 && totalPages == 1) {
        buttons = []
    }

    card.addModule({
        type: Card.Modules.Types.ACTION_GROUP,
        elements: buttons as any,
    })
    return card;
}