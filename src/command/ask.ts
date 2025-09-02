import { BaseCommand, CommandFunction, BaseSession } from 'kasumi.js';
import { client } from "init/client";
import OpenAI from "openai";
import { aliTTSClient } from '@/util/aliTTSClient';
import { voiceBot } from '@/bot/voiceBot';
import upath from 'upath';
import { ChatCompletionMessageParam } from 'openai/resources';

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
            let message: Array<ChatCompletionMessageParam> = [{
                role: "system", content: "你是一个聪明又可爱的助手，请模仿在番剧Mygo和Ave Mujica中千早爱音(Anon Chihaya)的风格并使用中文回答我的问题"
            }, { role: "user", content: askContent }]
            const stream = await openai.chat.completions.create({
                messages: message,
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
                client.logger.info('Full AI answer:', fullMessage);
                session.update(messageId, fullMessage);

                message.push({ role: "assistant", content: fullMessage });
                message.push({ role: "user", content: "请根据这篇文章（https://help.aliyun.com/zh/isi/developer-reference/ssml-overview?spm=a2c4g.11186623.0.0.79761d63iPZext#title-i3w-j10-5yw），生成你刚刚的回答的SSML标记语言版本，包括合适的断句分词方式、发音、速度、停顿、声调。" });
                const ttsAsk = await openai.chat.completions.create({
                    messages: message,
                    model: "deepseek-reasoner",
                });

                const ttsContext = ttsAsk.choices?.[0]?.message?.content || '';
                client.logger.info('TTS SSML:', ttsContext);

                const extractedXml = extractXmlFromMarkdown(ttsContext);

                if (extractedXml.length > 0) {
                    await aliTTSClient.startTTs(extractedXml);
                    await voiceBot.sendAudio(upath.join(__dirname, '..', 'audio', 'ttsAudio.wav'));
                }
            }
        }
    }
}

const extractXmlFromMarkdown = (text: string): string => {
    const regex = /```xml\s+([\s\S]*?)```/;
    const match = regex.exec(text);

    if (match && match[1]) {
        return match[1].trim();
    }
    return '';
}

const command = new Ask();
client.plugin.load(command);
export default command;