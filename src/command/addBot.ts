import { BaseCommand, CommandFunction, BaseSession } from 'kasumi.js';
import { client } from "init/client";
import Bot from '@/bot/bot';
import { Bilibili } from '@/util/bilibili';

class AddBot extends BaseCommand {
    name = 'addBot';
    description = 'manual add bot';

    func: CommandFunction<BaseSession, any> = async (session) => {
        if (session.args) {
            new Bot(await Bilibili.getLiveRoomInfo(parseInt(session.args[0])), session.args[1]);
        }
    }
}

const command = new AddBot();
client.plugin.load(command);
export default command;