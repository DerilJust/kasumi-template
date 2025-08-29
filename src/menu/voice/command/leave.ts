import { BaseCommand, BaseSession, CommandFunction } from "kasumi.js";
import { client } from "init/client";
import menu from "..";

class Leave extends BaseCommand {
    name = 'leave';
    description = '离开语音频道';
    func: CommandFunction<BaseSession, any> = async (session) => {
        client.logger.info("Listing guilds...");
        leaveChannel(session, session.args[0]);
    }
}

export const leaveChannel = async (session: BaseSession, channelId: string) => {
    const { err, data } = await client.API.voice.leave(channelId);
    if (err) {
        client.logger.error("Leave voice channel error:", err);
        session.send("离开语音频道失败，请稍后再试");
    } else {
        client.logger.info("Leave voice channel success:", data);
        session.send("已离开语音频道");
    }
}

const command = new Leave();
export default command;
menu.addCommand(command);