import { BaseCommand, BaseSession, Card, CommandFunction, Type } from "kasumi.js";
import { client } from "init/client";
import menu from "..";

class List extends BaseCommand {
    name = 'list';
    description = '获取频道列表';
    func: CommandFunction<BaseSession, any> = async (session) => {
        listChannel(session);
    }
}

const listChannel: CommandFunction<BaseSession, any> = async (session) => {
    client.logger.info("Channel List...");
    const guildId = process.env.GUILD_ID || '';
    if (guildId) {
        const page = 1;
        const pageSize = 10;
        for await (const { err, data } of client.API.channel.list(guildId, "voice", page, pageSize)) {
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
    return card;
}

const command = new List();
export default command;
// menu.addCommand(command);