import { client } from "init/client";
import { BaseCommand, BaseSession, Card, CommandFunction, Type } from "kasumi.js";
import menu from "..";

class Join extends BaseCommand {
    name = 'join';
    description = '加入某个语音频道';
    func: CommandFunction<BaseSession, any> = async (session) => {
        client.logger.info("Voice Join...");
        const page = 1;
        listChannel(session, page, 0);
    }
}

const listChannel = async (session: BaseSession, page: number, pageTotal: number) => {
    client.logger.info("Channel List...");
    const guildId = process.env.GUILD_ID || '';
    if (guildId) {
        for await (const { err, data } of client.API.channel.list(guildId, "voice", page, 10)) {
            if (err) {
                client.logger.error(guildId);
                if (err.message.includes("40000")) {
                    break;
                }
                client.logger.error(err);
                break;
            }
            // client.logger.info("channel data", data);
            session.send(createCard(data));
        }
    }
}

const createCard = (data: Type.MultiPageResponse<Type.BriefChannel>) => {
    const card = new Card({
        type: "card",
        theme: Card.Theme.INFO,
        size: Card.Size.LARGE,
    });
    card.addTitle("频道列表");
    data.items.forEach(channel => {
        card.addTextWithButton(`${channel.name} (${channel.id})`, {
            buttonContent: "加入",
            theme: Card.Theme.PRIMARY,
            value: channel.id,
            click: Card.Parts.ButtonClickType.RETURN_VALUE,
        });
    });

    const currentPage = data.meta.page;
    const totalPages = data.meta.page_total;

    const pageInfoLast = ["listJoinChannelLast", String(currentPage), String(totalPages)].join(',');
    const pageInfoNext = ["listJoinChannelNext", String(currentPage), String(totalPages)].join(',');

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
    card.addModule({
        type: Card.Modules.Types.ACTION_GROUP,
        // elements: [
        //     {
        //         type: Card.Parts.AccessoryType.BUTTON,
        //         text: {
        //             type: Card.Parts.TextType.PLAIN_TEXT,
        //             content: "上一页",
        //         },
        //         theme: Card.Theme.INFO,
        //         value: pageInfoLast,
        //         click: Card.Parts.ButtonClickType.RETURN_VALUE,
        //     },
        //     {
        //         type: Card.Parts.AccessoryType.BUTTON,
        //         text: {
        //             type: Card.Parts.TextType.PLAIN_TEXT,
        //             content: "下一页",
        //         },
        //         theme: Card.Theme.INFO,
        //         value: pageInfoNext,
        //         click: Card.Parts.ButtonClickType.RETURN_VALUE,
        //     },
        // ]
        elements: buttons as any,
    })
    return card;
}

const command = new Join();
export { command, listChannel };
menu.addCommand(command);