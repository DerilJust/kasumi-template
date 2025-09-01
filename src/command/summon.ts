import { BaseCommand, CommandFunction, BaseSession } from 'kasumi.js';
import { client } from "init/client";
import { voiceBot } from '@/bot/voiceBot';

class Summon extends BaseCommand {
    name = 'summon';
    description = 'manual summon voice bot';

    func: CommandFunction<BaseSession, any> = async (session) => {
        voiceBot.joinChannel();
    }
}

const command = new Summon();
client.plugin.load(command);
export default command;