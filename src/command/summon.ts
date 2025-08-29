import { BaseCommand, CommandFunction, BaseSession } from 'kasumi.js';
import { client } from "init/client";

class Summon extends BaseCommand {
    name = 'summon';
    description = '召唤AI进入频道';
    
    func: CommandFunction<BaseSession, any> = async (session) => {
        if (session.args.length) {
            await session.send(session.args.join(' '));
            console.log(session.args);
        }
    }
}