import { BaseCommand, BaseSession, Card, CommandFunction } from "kasumi.js";
import { client } from "init/client";
import menu from "..";

class List extends BaseCommand {
    name = 'list';
    description = '获取机器人加入的语音频道列表';
    func: CommandFunction<BaseSession, any> = async (session) => {
        client.logger.info("Listing guilds...");
        for await (const { err, data } of client.API.guild.list()) {
            if (err) {
                client.logger.error(err);
                break;
            }
            client.logger.info(data);
            // session.send(data as string);
        }
    }
}

export const listJoinChannel = async (session: BaseSession) => {
    try {
        const generator = await client.API.voice.list();
        for await (const response of generator) {
            if (response.err) {
                client.logger.error("Error fetching channels:", response.err);
                continue;
            }

            const channels = response.data.items;
            client.logger.info(`Page ${response.data.meta.page} of ${response.data.meta.page_total}`);

            const card = new Card({
                type: "card",
                theme: Card.Theme.INFO,
                size: Card.Size.LARGE,
            });
            card.addTitle("频道列表");
            channels.forEach(channel => {
                card.addText(`${channel.name} (${channel.id})`);
            });
            session.send(card);
        }
    } catch (error) {
        client.logger.error("Error listing voice channels:", error);
    }
}

export const listFirstJoinChannelId = async () => {
    var channelId;
    try {
        const generator = await client.API.voice.list();
        for await (const response of generator) {
            if (response.err) {
                client.logger.error("Error fetching channels:", response.err);
                continue;
            }

            const channels = response.data.items;
            client.logger.info(`Page ${response.data.meta.page} of ${response.data.meta.page_total}`);

            if (channels.length > 0) {
                channelId = channels[0].id;
            }
        }
    } catch (error) {
        client.logger.error("Error listing voice channels:", error);
    }
    return channelId;
}

const command = new List();
export default command;
menu.addCommand(command);