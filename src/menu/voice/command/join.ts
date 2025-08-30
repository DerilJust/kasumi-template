import { client } from "init/client";
import { BaseCommand, BaseSession, Card, CommandFunction, Type } from "kasumi.js";
import menu from "..";
import { addPageButton } from "@/util/addPageButton";

class Join extends BaseCommand {
    name = 'join';
    description = '加入某个语音频道';
    func: CommandFunction<BaseSession, any> = async (session) => {
        client.logger.info("Voice Join...");
        const page = 1;
        listChannel(session, page);
    }
}

const listChannel = async (session: BaseSession, page: number) => {
    client.logger.info("Channel List...");
    const guildId = process.env.GUILD_ID || '';
    if (guildId) {
        for await (const { err, data } of client.API.channel.list(guildId, "voice", page, 8)) {
            if (err) {
                if (err.message.includes("40000")) {
                    break;
                }
                client.logger.error(err);
                break;
            }
            session.send(createCard(data));
        }
    }
}

const createCard = (data: Type.MultiPageResponse<Type.BriefChannel>) => {
    var card = new Card({
        type: "card",
        theme: Card.Theme.INFO,
        size: Card.Size.LARGE,
    });
    card.addTitle("频道列表");
    data.items.forEach(channel => {
        card.addTextWithButton(`${channel.name} (${channel.id})`, {
            buttonContent: "加入",
            theme: Card.Theme.PRIMARY,
            value: ["joinChannel", channel.id].join(','),
            click: Card.Parts.ButtonClickType.RETURN_VALUE,
        });
    });

    card = addPageButton(card, { page: data.meta.page, page_total: data.meta.page_total }, ['listJoinChannelLast', 'listJoinChannelNext']);
    return card;
}

const command = new Join();
export { command, listChannel };
menu.addCommand(command);