import { BaseCommand, BaseSession, CommandFunction } from "kasumi.js";
import { client } from "init/client";
import menu from "..";

class List extends BaseCommand {
    name = 'list';
    description = '获取当前用户加入的服务器列表';
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

const command = new List();
export default command;
menu.addCommand(command);