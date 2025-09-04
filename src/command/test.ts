import { BaseCommand, CommandFunction, BaseSession, Card } from 'kasumi.js';
import { client } from "init/client";
import { Bilibili } from '@/util/bilibili';
import Bot from '@/bot/bot';

class Test extends BaseCommand {
    name = 'test';
    description = 'Test';

    func: CommandFunction<BaseSession, any> = async (session) => {
        const bot = new Bot(await Bilibili.getLiveRoomInfo(510), '阿梓');
        bot.test();
    }
}

const command = new Test();
client.plugin.load(command);
export default command;