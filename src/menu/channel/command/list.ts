import { BaseCommand, BaseSession, Card, CommandFunction, Type } from "kasumi.js";
import { addPageButton } from "@/util/addPageButton";
import { client } from "init/client";
import menu from "..";

class ListVoice extends BaseCommand {
    name = 'listVoice';
    description = '获取语音频道列表';
    func: CommandFunction<BaseSession, any> = async (session) => {
        await listChannel(session, 'voice', 1);
    }
}

class ListText extends BaseCommand {
    name = 'listText';
    description = '获取文字频道列表';
    func: CommandFunction<BaseSession, any> = async (session) => {
        await listChannel(session, 'text', 1);
    }
}

const listChannel = async (session: BaseSession, type: "text" | "voice", page: number) => {
    client.logger.info("Channel List...");
    const guildId = process.env.GUILD_ID || '';
    if (guildId) {
        for await (const { err, data } of client.API.channel.list(guildId, type, page, 8)) {
            if (err) {
                if (err.message.includes("40000")) {
                    break;
                }
                client.logger.error(err);
                break;
            }
            session.send(createCard(data, type));
        }
    }
}

const createCard = (data: Type.MultiPageResponse<Type.BriefChannel>, type: "text" | "voice") => {
    var card = new Card({
        type: "card",
        theme: Card.Theme.INFO,
        size: Card.Size.LARGE,
    });
    card.addTitle("频道列表");
    data.items.forEach(channel => {
        card.addText(`${channel.name} (${channel.id})`);
    });

    var eventNames: string[] = []
    if (type === 'text') {
        eventNames = ['listTextChannelLast', 'listTextChannelNext'];
    }
    if (type === 'voice') {
        eventNames = ['listVoiceChannelLast', 'listVoiceChannelNext'];
    }

    card = addPageButton(card, { page: data.meta.page, page_total: data.meta.page_total }, eventNames);
    return card;
}

const listVoice = new ListVoice();
const listText = new ListText();

menu.addCommand(listVoice);
menu.addCommand(listText);

export default { listVoice, listText, listChannel };