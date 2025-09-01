import { BaseCommand, CommandFunction, BaseSession, Card } from 'kasumi.js';
import { client } from "init/client";
import { Bilibili } from '@/util/bilibili';

class Test extends BaseCommand {
    name = 'test';
    description = 'Test';

    func: CommandFunction<BaseSession, any> = async (session) => {
        if (session.args.length) {
            const data = await Bilibili.getLiveRoomInfo(parseInt(session.args[0]));
            client.logger.info("Bilibili Room Info:", data);
            const card = new Card({
                type: "card",
                theme: Card.Theme.INFO,
                size: Card.Size.LARGE,
            });
            card.addContext()
        }
    }
}

const command = new Test();
client.plugin.load(command);
export default command;