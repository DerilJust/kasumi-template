import { BaseCommand, BaseSession, CommandFunction } from "kasumi.js";
import { client } from "init/client";
import menu from "..";

class View extends BaseCommand {
    name = 'view';
    description = '获取服务器详情';
    func: CommandFunction<BaseSession, any> = async (session) => {
        client.logger.info("view guild...");
        client.API.guild.view(process.env.GUILD_ID || '').then(({ err, data }) => {
            if (err) {
                client.logger.error(err);
                return;
            }
            client.logger.info(data);
            session.send(JSON.stringify(data, null, 2));
        });
    }
}

const command = new View();
export default command;
menu.addCommand(command);