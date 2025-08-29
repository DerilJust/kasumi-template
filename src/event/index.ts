import { listChannel } from "@/menu/voice/command/join";
import { client } from "init/client";
import { BaseSession } from "kasumi.js";

client.on('message.text', (event) => {
    console.log("event:", event.content);
});

client.on('event.button', (event) => {
    console.log("event.button content: ", event.content);
    console.log("event.button channel id:", event.channelId);
    console.log("event.button value:", event.value);
    const [action, pageStr, pageTotalStr] = event.value.split(',');
    const page = parseInt(pageStr) || 1;
    const pageTotal = parseInt(pageTotalStr) || 10;
    if (action === 'listJoinChannelLast') {
        const session = new BaseSession([], event, client);
        listChannel(session, page - 1, pageTotal);
    }
    if (action === 'listJoinChannelNext') {
        const session = new BaseSession([], event, client);
        listChannel(session, page + 1, pageTotal);
    }
});
