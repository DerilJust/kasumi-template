import { BaseCommand, CommandFunction, BaseSession } from 'kasumi.js';
import { client } from "init/client";
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-39f35b37368c4b0aa338331bdb769fc0'
});

class Ask extends BaseCommand {
    name = "ask";
    description = "问AI问题";

    func: CommandFunction<BaseSession, any> = async (session) => {
        if (session.args.length) {
            const askContent = session.args.join(' ');
            client.logger.info("User question:", askContent);
            const stream = await openai.chat.completions.create({
                messages: [{ role: "system", content: "你是一个聪明又可爱的助手，请用在番剧Mygo和Ave Mujica中千早爱音的风格回答我的问题" }, { role: "user", content: askContent }],
                model: "deepseek-reasoner",
                stream: true,
            });
            for await (const chunk of stream) {
                const content = chunk.choices?.[0]?.delta?.content;
                client.logger.info('AI answer:', content);
                if (content) process.stdout.write(content);
            }
            // const answer = completion.choices[0].message.content || "对不起，我无法回答你的问题。";
            // client.logger.info('AI answer:', answer);
            // const { err, data } = await session.send(answer);
            // if (err) {
            //     client.logger.error('Error sending message:', err);
            // } else {

            // }
        }
    }
}

const command = new Ask();
client.plugin.load(command);
export default command;