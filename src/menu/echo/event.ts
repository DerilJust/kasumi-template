import { client } from "init/client";

client.on('message.text', (event) => {
    console.log(event.content);
});