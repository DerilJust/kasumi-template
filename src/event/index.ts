import { listChannel } from "@/menu/voice/command/join";
import { client } from "init/client";
import { BaseSession } from "kasumi.js";
import { leaveChannel } from "@/menu/voice/command/leave";
import { listFirstJoinChannelId } from "@/menu/voice/command/list";
import { IAudioJoinResponse } from "@/voiceClient/client";
import VoiceClient from "@/voiceClient/client";
import * as path from 'path';

client.on('message.text', (event) => {
    console.log("event:", event.content);
});

client.on('event.button', async (event) => {
    console.log("event.button content: ", event.content);
    console.log("event.button channel id:", event.channelId);
    console.log("event.button value:", event.value);

    const [action, arg1] = event.value.split(',');
    const session = new BaseSession([], event, client);
    if (action === 'listJoinChannelLast') {
        const page = parseInt(arg1) || 1;
        listChannel(session, page - 1);
    }
    if (action === 'listJoinChannelNext') {
        const page = parseInt(arg1) || 1;
        listChannel(session, page + 1);
    }
    if (action === 'joinChannel') {
        const channelId = arg1;
        const joinChannelId = await listFirstJoinChannelId();
        if (joinChannelId) {
            leaveChannel(session, joinChannelId);
        }
        if (channelId) {
            client.API.voice.join(channelId, {}).then(({ err, data }) => {
                if (err) {
                    client.logger.error("Join voice channel error:", err);
                } else {
                    client.logger.info("Join voice channel success:", data);
                    const vc = new VoiceClient(data as IAudioJoinResponse);
                    const AUDIO_FILE_PATH = path.join(__dirname, '..', 'audio', '16k.wav');
                    vc.streamAudio(AUDIO_FILE_PATH).then(() => {
                        client.logger.info("Audio streaming finished.");
                    }).catch((error) => {
                        client.logger.error("Audio streaming error:", error);
                    });
                }
            });
        }
    }
});
