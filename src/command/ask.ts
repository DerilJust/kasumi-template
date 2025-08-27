import { BaseCommand, CommandFunction, BaseSession } from 'kasumi.js';
import { client } from "init/client";
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-39f35b37368c4b0aa338331bdb769fc0'
});

class Ask extends BaseCommand {
    name = "ask";
    description = "ask ai something";

    func: CommandFunction<BaseSession, any> = async (session) => {
        if (session.args.length) {
            const completion = await openai.chat.completions.create({
                messages: [{ role: "system", content: "You are a helpful assistant." }],
                model: "deepseek-chat",
            });
            console.log(completion.choices[0].message.content);
            await session.send(completion.choices[0].message.content as string);
            console.log(session.args);
        }
    }
}

const command = new Ask();
client.plugin.load(command);
export default command;