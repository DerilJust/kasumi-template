import { BaseCommand, CommandFunction, BaseSession } from 'kasumi.js';
import { client } from "init/client";
import OpenAI from "openai";
import { aliTTSClient } from '@/util/aliTTSClient';
import { voiceBot } from '@/bot/voiceBot';
import upath from 'upath';

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.OPENAI_API_KEY,
});

class Ask extends BaseCommand {
    name = "ask";
    description = "问AI问题";

    func: CommandFunction<BaseSession, any> = async (session) => {
        if (session.args.length) {
            const askContent = session.args.join(' ');
            client.logger.info("User question:", askContent);
            const stream = await openai.chat.completions.create({
                messages: [{ role: "system", content: "你是一个聪明又可爱的助手，请模仿在番剧Mygo和Ave Mujica中千早爱音(Anon Chihaya)的风格并使用中文回答我的问题" }, { role: "user", content: askContent }],
                model: "deepseek-reasoner",
                stream: true,
            });
            const { data } = await session.send("正在向AI提问，请稍候...");
            if (data) {
                const messageId = data.msg_id;
                const stringBuilder: string[] = [];
                for await (const chunk of stream) {
                    const content = chunk.choices?.[0]?.delta?.content;
                    if (content) {
                        stringBuilder.push(content);
                        session.update(messageId, stringBuilder.join(''));
                        client.logger.info('AI answer:', content);
                    }
                }
                const fullMessage = stringBuilder.join('');
                console.log('Full AI answer:', fullMessage);
                session.update(messageId, fullMessage);
                await aliTTSClient.startTTs(fullMessage);
                await voiceBot.sendAudio(upath.join(__dirname, '..','audio','ttsAudio.wav'));
            }
        }
    }
}

const command = new Ask();
client.plugin.load(command);
export default command;